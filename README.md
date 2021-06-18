!nstant-markdown-d
==================

[![npm](https://img.shields.io/npm/v/instant-markdown-d)](https://www.npmjs.com/package/instant-markdown-d)
[![Node.js](https://github.com/instant-markdown/instant-markdown-d/workflows/Node.js/badge.svg)](https://github.com/instant-markdown/instant-markdown-d/actions/workflows/nodejs.yml)
[![open collective badge](https://opencollective.com/instant-markdown/tiers/backer/badge.svg?label=backer&color=brightgreen)](https://opencollective.com/instant-markdown/)

instant-markdown-d is a small Node.js server that enables instant compilation
and previewing of Markup files. A plugin can easily be written for any text
editor to interface with it. One currently exists for Vim:
https://github.com/instant-markdown/vim-instant-markdown

Installation
------------

Install the mini-server by running either:

    [sudo] npm -g install instant-markdown-d

or ~~using yarn~~ (not recommended. See issue #86):

    [sudo] yarn global add instant-markdown-d

To install from the bleeding edge development version, read the [contributing
guide](CONTRIBUTING.md). See
[vim-instant-markdown](https://github.com/instant-markdown/vim-instant-markdown)
for Vim / Neovim integration.

REST API
--------

| Action                   | HTTP Method | Request URL               | Request Body                   |
|--------------------------|-------------|---------------------------|--------------------------------|
| Refresh Markdown on page | PUT         | http://localhost:\<port\> | \<New Markdown file contents\> |
| Close Webpage            | DELETE      | http://localhost:\<port\> |                                |

By default, `<port>` is 8090

Environment variables
---------------------

* `INSTANT_MARKDOWN_OPEN_TO_THE_WORLD=1` - by default, the server only listens
  on localhost. To make the server available to others in your network, set this
  environment variable to a non-empty value. Only use this setting on trusted
  networks!

* `INSTANT_MARKDOWN_ALLOW_UNSAFE_CONTENT=1` - by default, scripts are blocked.
  Use this preference to allow scripts.

* `INSTANT_MARKDOWN_BLOCK_EXTERNAL=1` - by default, external resources such as
  images, stylesheets, frames and plugins are *allowed*. Use this setting to
  *block* such external content.

* `INSTANT_MARKDOWN_MATHJAX_FONTS="/usr/share/mathjax/fonts/HTML-CSS/"` - to
  serve fonts for Mathjax from a local directory.
