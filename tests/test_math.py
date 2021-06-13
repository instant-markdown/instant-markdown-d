def test_math(server, browser):
    server.post("tests/test_math.md")
    result = browser.get("http://localhost:8090")

    latex_envs = ("align*", "aligned", "eqnarray", "equation", "$$")
    if "--mathjax" in server.options:
        assert all(env not in result for env in latex_envs)
    else:
        assert all(env in result for env in latex_envs)
