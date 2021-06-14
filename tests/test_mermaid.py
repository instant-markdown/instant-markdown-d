import pytest


@pytest.mark.parametrize("server_options", ["--debug", "--debug --mermaid"])
@pytest.mark.parametrize("method", ["send_curl", "send_stdin"])
def test_mermaid(browser, Server, server_options, method):

    with Server(server_options) as srv:
        send = getattr(srv, method)
        send("tests/test_mermaid.md")

        result = browser.get(srv.port)

    assert '<span class="test-case"></span>' in result, "No text was rendered"

    if "--mermaid" in server_options:
        elems = browser.find_elements_by_class_name("mermaid")
        assert all(
            e.get_attribute("data-processed") == "true" for e in elems
        ), "Mermaid.js processing not completed"
    else:
        elems = browser.find_elements_by_class_name("language-mermaid")
        assert all(
            e.tag_name == "code" for e in elems
        ), "Raw Mermaid.js unprocessed html tags missing"
