import pytest


def test_code(browser, Server):

    with Server("--debug", 8090) as srv:
        srv.send("curl", "tests/test_code.md")

        result = browser.get(srv.port)

    assert '<span class="test-case"></span>' in result, "No text was rendered"

    elems = browser.find_elements_by_xpath("//pre/code/span")
    assert all(
        e.get_attribute("class").startswith("hljs-") for e in elems
    ), "Highlight.js processing not completed"
