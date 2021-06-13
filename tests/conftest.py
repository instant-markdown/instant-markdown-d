import logging
import os
import signal
import subprocess
import time
from shutil import which

import pytest
from selenium import webdriver
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary


logger = logging.getLogger('instant-markdown-d_tests')


class BrowserEngine(webdriver.Firefox):
    def __init__(self):
        os.environ["MOZ_HEADLESS"] = "1"
        binary = FirefoxBinary()
        binary.add_command_line_options("--headless")
        super().__init__(firefox_binary=binary)

    def get(self, url):
        # self.refresh()
        logger.info("Fetching", url)
        super().get(url)
        time.sleep(0.2)
        return self.page_source

    def __enter__(self):
        logger.info("Running Firefox headless")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # kill the specific child process
        self.service.process.send_signal(signal.SIGTERM)

        del os.environ["MOZ_HEADLESS"]

        logger.info("Exiting Firefox.")
        # quit the node process
        self.quit()


class InstantMarkdownD:
    def __init__(self, options):
        self.options = options.split()

    def __enter__(self):
        node = which("node")
        cmd = (node, "./src/cli.js", *self.options)
        logger.info(f"Launching {' '.join(cmd)}")
        self.process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.process.terminate()

    def post(self, markdown_file):
        logger.info(f"POST {markdown_file}")
        with open(markdown_file, "rb") as mf:
            text = mf.read()

        self.process.communicate(input=text)


@pytest.fixture(scope="session")
def browser():
    with BrowserEngine() as b:
        yield b


@pytest.fixture(
    scope="session",
    params=["--debug", "--debug --mathjax", "--debug --port=9090"],
)
def server(request):
    with InstantMarkdownD(request.param) as srv:
        yield srv
