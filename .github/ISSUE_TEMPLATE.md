# Problem summary

## Expected


## Environment Information

 * OS and version:
 * Vim / Neovim version:
 * Browser and version:

## Provide the output of test command (required)

Run the test by installing the master version (instructions valid for
Linux / macOS):

```sh
export NPM_PACKAGES=$HOME/.npm-packages
export PATH="$NPM_PACKAGES/bin:$PATH"
export NODE_PATH="$NPM_PACKAGES/lib/node_modules:$NODE_PATH"

git clone https://github.com/suan/instant-markdown-d
cd instant-markdown-d
npm install -g .
npm test&; sleep 5; npm stop
```

If the above doesn't work, at least run

```sh
curl -LO https://raw.githubusercontent.com/suan/instant-markdown-d/master/tests/test_math.md
cat test_math.md | instant-markdown-d --mathjax --debug
```

and paste the console output here:

```sh

```

## Generate logfiles if appropriate

 1. package-lock.json / yarn.lock
 2. minimal `~/.vimrc` or `~/.config/nvim/init.vim` where variables for `vim-instant-markdown` defined
 3. `debug.html`

## Steps to reproduce the issue (required)

Start with command you used to install `instant-markdown-d`

 1.
 2.
 3.


## Screen shot (if possible)


