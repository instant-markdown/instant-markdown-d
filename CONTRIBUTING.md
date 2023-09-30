# Install in development mode

Ensure that prefix points to somewhere you have access to (such as the home directory in Linux).

    npm prefix -g

Read more on [how to configure `npm`'s paths](https://stackoverflow.com/a/13021677).

    npm install
    npm link .

## Testing

Simple integration test

    npm run test

Fine grained tests with checks for output requires Python, Firefox and geckodriver.    

    python -m venv venv && source venv/bin/activate && pip install -r tests/requirements.txt
    pytest --log-cli-level=info

# Making a release

Update changelog and finalize changes

    git commit
    npm version prerelease # or patch, minor, major

Package

    npm run prepare  # runs genversion
    git add version.js
    npm pack  # automatically commits and tags

Deploy

    git push
    git push --tags
    npm publish

