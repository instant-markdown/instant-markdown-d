import pytest


@pytest.mark.parametrize("method", ["send_curl", "send_stdin"])
def test_math(server, browser, method):
    send = getattr(server, method)
    send("tests/test_math.md")

    result = browser.get(server.port)

    assert "Math with MathJax" in result, "No text was rendered"

    latex_envs = (r"\begin", r"\end", "$$")
    if "--mathjax" in server.options:
        assert all(
            env not in result for env in latex_envs
        ), "LaTeX equations should have been rendered as MathJax, but that did not happen"
    else:
        assert all(
            env in result for env in latex_envs
        ), "LaTeX equations are not left as it is"
