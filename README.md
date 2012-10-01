!nstant-markdown-d
================
instant-markdown-d is a small Node.js server that enables instant compilation and previewing of Markup files. A plugin can easily be written for any text editor to interface with it. One currently exists for VIm: https://github.com/suan/vim-instant-markdown

Installation
------------
- `[sudo] gem install redcarpet pygments.rb`
- `[sudo] npm install -g --from-git https://github.com/leifdenby/instant-markdown-d`

REST API
--------
| Action                   | HTTP Method | Request URL               | Request Body |
|--------------------------|-------------|---------------------------|--------------------|
| Refresh Markdown on page | PUT         | http://localhost:\<port\> | \<New Markdown file contents\> |
| Close Webpage            | DELETE      | http://localhost:\<port\> | |

By default, `<port>` is 8090

Credits
-------
Aaron Lampros's [Docter][docter], which is the underlying Markdown converter and styler.


[docter]: https://github.com/alampros/Docter
