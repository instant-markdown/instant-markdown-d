import logging
import signal
import subprocess
import time
from shutil import which

import pycurl
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

logger = logging.getLogger("instant-markdown-d_tests")


class BrowserEngine(webdriver.Firefox):
    def __init__(self):
        # Deprecated API
        # from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
        # binary = FirefoxBinary()
        # binary.add_command_line_options("--headless")
        # super().__init__(firefox_binary=binary)

        options = webdriver.FirefoxOptions()
        options.add_argument("--headless")
        super().__init__(options=options)

    def get(self, port):
        url = f"http://localhost:{port}/"

        #  self.back()
        #  self.refresh()

        logger.info(f"Get {url}")
        super().get(url)

        # Explicit wait for 2 seconds and until a html tag with a class/id is
        # located
        _ = WebDriverWait(self, 2).until(
            EC.presence_of_element_located((By.CLASS_NAME, "test-case"))
        )

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
        if port != 8090:
            self.options.append(f"--port={port}")

    def __enter__(self):
        node = which("node")
        cmd = (node, "./src/cli.js", *self.options)
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

    def send_stdin(self, markdown_file):
        logger.info(f"send via stdin {markdown_file}")
        with open(markdown_file, "rb") as file:
            text = file.read()

            # Blocks!
            # self.process.communicate(input=text, timeout=2)
            self.process.stdin.write(text)

    def send_curl(self, markdown_file):
        logger.info(f"send via curl using REST API {markdown_file}")

        c = pycurl.Curl()
        c.setopt(c.URL, f"http://localhost:{self.port}")

        c.setopt(c.UPLOAD, 1)
        with open(markdown_file, "rb") as file:
            # File must be kept open while Curl object is using it
            c.setopt(c.READDATA, file)

            c.perform()
            assert c.getinfo(c.RESPONSE_CODE) == 200, "PUT request failed"
            c.close()


@pytest.fixture(scope="function")
def browser():
    with BrowserEngine() as b:
        yield b


@pytest.fixture(
    scope="function",
    params=["--debug", "--debug --mathjax"],  # ("--debug", 9090)
)
def server(request):
    with InstantMarkdownD(request.param) as srv:
        yield srv
