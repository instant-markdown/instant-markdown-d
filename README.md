!nstant-markdown-d
================
instant-markdown-d is a small Node.js server that enables instant compilation and previewing of Markup files. A plugin can easily be written for any text editor to interface with it. One currently exists for VIm: https://github.com/suan/vim-instant-markdown. 

It currently also allows rendering latex markdown mathematical formulas via Katex. 

Installation
------------
- `[sudo] npm -g install instant-markdown-d`

REST API
--------
 | Action                   | HTTP Method   | Request URL                 | Request Body                   | 
 | ---------------------    | ------------- | --------------------------- | --------------------           | 
 | Refresh Markdown on page | PUT           | http://localhost:\<port\>   | \<New Markdown file contents\> | 
 | Close Webpage            | DELETE        | http://localhost:\<port\>   |                                | 

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

* `INSTANT_MARKDOWN_SERVE_FOLDER_TREE=1` - enables serving all content files without restriction of file type, starting from the base folder from which the instance is run, and including files under any of its sub-folders. This is disabled by default (set to 0), as it can potentially be a security concern in specific scenarios.
