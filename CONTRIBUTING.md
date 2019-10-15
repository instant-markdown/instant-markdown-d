# Install in development mode

    npm install -g .
    npm install --only=dev .

# Making a release

Test

    npm run test

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

