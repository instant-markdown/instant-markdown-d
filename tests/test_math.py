import pytest


@pytest.mark.parametrize(
    "server_options,port",
    [("--debug", 8090), ("--debug --mathjax", 8090), ("--debug", 9090)],
)
@pytest.mark.parametrize("method", ["curl", "stdin"])
def test_math(browser, Server, server_options, port, method):

    with Server(server_options, port) as srv:
        srv.send(method, "tests/test_math.md")

        result = browser.get(srv.port)

    assert '<span class="test-case"></span>' in result, "No text was rendered"

    latex_envs = (r"\begin", r"\end", "$$")
    if "--mathjax" in server_options:
        assert all(env not in result for env in latex_envs), (
            "LaTeX equations should have been rendered as MathJax, "
            "but that did not happen"
        )
    else:
        assert all(
            env in result for env in latex_envs
        ), "LaTeX equations are not left as it is"
