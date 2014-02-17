!nstant-markdown-d
================
instant-markdown-d is a small Node.js server that enables real-time compilation and previewing of Markdown (and LaTEX, reST, etc) files in a browser. A plugin can easily be written for any text editor to interface with it. One currently exists for VIm: https://github.com/suan/vim-instant-markdown

Installation
------------
- `[sudo] npm -g install instant-markdown-d`
- If you're on Linux and the `xdg-open` executable is not present, install `xdg-utils` through your package manager
- If you plan on previewing any formats other than github-flavored-markdown, install [pandoc][pandoc]

Running the server
------------------
    $ cat <markdown_file> | instant-markdown-d

REST API
--------
| Action                    | HTTP Method | Request URL                       | Request Body |
|---------------------------|-------------|-----------------------------------|-----------------------------------|
| Refresh Markdown on page  | PUT         | `http://localhost:<port>`         | `<New Markdown file contents>`    |
| Set input format          | PUT         | `http://localhost:<port>/format`  | `<format>`                        |
| Close Webpage             | DELETE      | `http://localhost:<port>`         |                                   |

- By default, `<port>` is 8090.
- Supported `<format>s`are: `gfm` (default), `markdown`, `html`, `rest`, `textile`, `docbook`, and `latex`. 
  - You don't have to call the _set input format_ endpoint if you're only using github-flavored-markdown (gfm).
  - `markdown` is for the "plain" markdown format, which doesn't have any of the Github-added features.

Read-only preview
-----------------
This module installs a second executable, `instant-markdown`, which just converts a given markdown file, opens it in your default browser, and exits - perfect for cases where you simply want to read a markdown file. Usage:

```
instant-markdown <filename>
```

_NOTE: Each `instant-markdown` invocation will create a tempfile that won't be deleted until your machine is restarted, so be wary of calling it thousands of times in a script._

Credits
-------
Aaron Lampros's [Docter][docter], which is the underlying Markdown converter and styler.


[docter]: https://github.com/alampros/Docter
[pandoc]: http://johnmacfarlane.net/pandoc/installing.html
