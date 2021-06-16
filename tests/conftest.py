import logging
import time
import signal
import socket
import subprocess
from shutil import which

import pycurl
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

logger = logging.getLogger("instant-markdown-d_tests")


def port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("localhost", port)) == 0


def browser_wait_condition(driver):
    span_test_case = EC.presence_of_element_located((By.CLASS_NAME, "test-case"))
    div_con_error = EC.invisibility_of_element_located((By.ID, "con-error"))
    return span_test_case(driver) and div_con_error(driver)


class BrowserEngine(webdriver.Firefox):
    def __init__(self):
        options = webdriver.FirefoxOptions()
        options.add_argument("--headless")
        super().__init__(options=options)

    def get(self, port):
        url = f"http://localhost:{port}/"

        self.back()
        logger.info(f"Get {url}")
        super().get(url)

        # Explicit wait for 2 seconds and until a html tag with a class/id is
        # located
        _ = WebDriverWait(self, 2).until(browser_wait_condition)

        html = self.page_source
        return html

    def __enter__(self):
        logger.info("Running Firefox headless")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # close the window
        self.close()

        # quit the node process
        self.quit()

        # kill the specific child process, if needed
        if self.service.process is not None:
            self.service.process.send_signal(signal.SIGTERM)

        logger.info("Exiting Firefox")


class InstantMarkdownD:
    def __init__(self, options, port=8090):
        self.port = port
        self.options = options.split()

        for tries in range(5):
            if port_in_use(port):
                logger.warning(
                    f"Port {port} is active. Tests may fail. Trying again"
                )
                time.sleep(0.2)
            else:
                break
        else:
            # break not encountered => port is active
            logger.error(
                "Giving up checks for port. "
                "Is instant-markdown-d already running?"
                "Check if instant-markdown-d is running in the background, "
                "using `pgrep -af node` in Unix or equivalent"
            )

        if port != 8090:
            self.options.append(f"--port={port}")

    def __enter__(self):
        node = which("node")
        cmd = [node, "./src/cli.js", *self.options]
        logger.info(f"Running {' '.join(cmd)}")
        self.process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=False,
        )
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        logger.info("Exiting instant-markdown-d")
        self.process.terminate()

    def send(self, via, markdown_file):
        # Wait some time to ensure the server has launched
        # TODO: find a better way: signal? return code? daemon?
        for tries in range(5):
            if port_in_use(self.port):
                break
            else:
                logger.info(f"Port {self.port} is inactive. Waiting... ")
                time.sleep(0.5)
        else:
            # break not encountered => port inactive
            raise IOError(
                "Giving up checks for port. "
                "Has instant-markdown-d failed to start?"
            )

        method = getattr(self, f"send_{via}")
        method(markdown_file)

    def send_stdin(self, markdown_file):
        logger.info(f"send via stdin {markdown_file}")
        with open(markdown_file, "rb") as file:
            text = file.read()

            # Blocks! so give it enough time to pass text to stdin.
            try:
                self.process.communicate(input=text, timeout=1)
            except subprocess.TimeoutExpired:
                pass

    def send_curl(self, markdown_file):
        logger.info(f"send via curl using REST API {markdown_file}")

        # Equivalent to
        # curl -X PUT -T {markdown_file} http://localhost:{port}
        c = pycurl.Curl()
        c.setopt(c.URL, f"http://localhost:{self.port}")

        c.setopt(c.UPLOAD, 1)
        with open(markdown_file, "rb") as file:
            # File must be kept open while Curl object is using it
            c.setopt(c.READDATA, file)

            c.perform()
            assert c.getinfo(c.RESPONSE_CODE) == 200, "PUT request failed"
            c.close()


@pytest.fixture(scope="session")
def browser():
    with BrowserEngine() as b:
        yield b


@pytest.fixture(scope="function")
def Server():
    return InstantMarkdownD
