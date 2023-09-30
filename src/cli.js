#!/usr/bin/env node
"use strict";
// node builtins
const process = require('process'),
  server = require('http').createServer(httpHandler),
  exec = require('child_process').exec,
  os = require('os'),
  fs = require('fs'),
  path = require('path'),
  url = require('url');

const argv = require('minimist')(process.argv.slice(2), {
  string: ['browser'],
  default: {port: 8090, debug: false},
  alias: {V: 'version', h: 'help'},
});

const MarkdownIt = require('markdown-it'),
  hljs = require('highlight.js'),
  io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: [
        "GET",
        "PUT",
        "DELETE"
      ],
      credentials: true
    }
  }),
  send = require('send');

const mjpage = require('mathjax-node-page').mjpage;
const taskLists = require('markdown-it-task-lists');
const frontMatter = require('markdown-it-front-matter');

if (argv.version || argv.debug) {
  const version= require('./version');
  console.log(`instant-markdown-d version: v${version}`);
  console.log(`nodejs version: ${process.version}`);
}
if (argv.help) {
  console.log(`\
Usage: instant-markdown-d [OPTIONS]

Options:
  --mathjax          Enable MathJax parsing
  --mermaid          Enable Mermaid.js diagrams
  --browser BROWSER  Use a custom browser
  --port PORT        Use a custom port (default: 8090)
  --debug            Be verbose and do not open browser
  -V, --version      Display version
  -h, --help         Display help\
  `);
}
if (argv.version || argv.help) process.exit(0);

if (argv.debug) console.dir(argv);

// console.dir(argv);
// WARNING: By setting this environment variable, anyone on your network may
// run arbitrary code in your browser and read arbitrary files in the working
// directory of the open file!
if (process.env.INSTANT_MARKDOWN_OPEN_TO_THE_WORLD) {
  // Listen on any interface.
  server.listen(argv.port, onListening).once('error', onServerError);
} else {
  // Listen locally.
  server.listen(argv.port, '127.0.0.1', onListening).once('error', onServerError);
}

let md = new MarkdownIt({
  html: true,
  linkify: true,
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, {language: lang}).value;
      } catch (err) {
        // Do nothing
      }
    } else {
      return str;
    }
  }
}).use(taskLists, {enabled: true}).use(frontMatter, function(fm){});

if (argv.mathjax) md.use(require('markdown-it-mathjax')());
if (argv.mermaid)  md.use(require('markdown-it-textual-uml'));

const mjPageConfig = {
  format: ["TeX"],
  cssInline: false,
};

if (process.env.INSTANT_MARKDOWN_MATHJAX_FONTS) {
  mjPageConfig.fontURL = process.env.INSTANT_MARKDOWN_MATHJAX_FONTS;
}

const mjNodeConfig = {
  html: true,
  // mml: true,
  // svg: true,
  equationNumbers: "AMS",
  speakText: false
};

function mathJaxRenderEmit(newHtml) {
  if(argv.mathjax) {
    mjpage(
      newHtml,
      mjPageConfig,
      mjNodeConfig,
      function(data) {
          if (argv.debug) {
            console.log("Rendered html saved as debug.html")
            // console.debug(data); // resulting HTML string
            fs.writeFileSync('debug.html', data, 'utf-8'); // debug
          }
          io.emit('newContent', data);
      }
    );
  }
  else {
    io.emit('newContent', newHtml)
  }
  if (argv.debug) {
    console.debug('Emitting new data');
    // console.debug(newHtml); // resulting HTML string
  }
}

let lastWrittenMarkdown = '';
function writeMarkdown(body) {
  lastWrittenMarkdown = md.render(body);
  mathJaxRenderEmit(lastWrittenMarkdown);
}

function readAllInput(input, callback) {
  let body = '';
  input.on('data', function(data) {
    body += data;
    if (body.length > 1e6) {
      throw new Error('The request body is too long.');
    }
  });
  input.on('end', function() {
    callback(body);
  });
}

function addSecurityHeaders(req, res, isIndexFile) {
  let csp = [];

  // Cannot use 'self' because Chrome does not treat 'self' as http://host
  // when the sandbox directive is set.
  let HTTP_HOST = req.headers.host || 'localhost:' + argv.port;
  let CSP_SELF = 'http://' + HTTP_HOST;

  if (!process.env.INSTANT_MARKDOWN_ALLOW_UNSAFE_CONTENT) {
    if (isIndexFile) {
      // index.html will drop the scripting capabilities upon load.
      csp.push('script-src ' + CSP_SELF + " 'unsafe-inline'");
      csp.push('sandbox allow-scripts allow-modals allow-forms');
    } else {
      csp.push('script-src ');
    }
  }
  if (process.env.INSTANT_MARKDOWN_BLOCK_EXTERNAL) {
    csp.push('default-src data: ' + CSP_SELF);
    csp.push("style-src data: 'unsafe-inline' " + CSP_SELF);
    csp.push('connect-src ' + CSP_SELF + ' ws://' + HTTP_HOST);
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', csp.join('; '));
  if (isIndexFile) {
    // Never cache the index file, to make sure that changes to the CSP are
    // picked up across soft reloads.
    res.setHeader('Cache-Control', 'no-store');
  }
  if (argv.debug) console.debug(`Content-Security-Policy=${csp}`)
}

function httpHandler(req, res) {
  if (argv.debug) console.debug("Received %s request", req.method);


  switch(req.method)
  {
    case 'GET': {
        // Example: /my-repo/raw/master/sub-dir/some.png
        let githubUrl = req.url.match(/\/[^\/]+\/raw\/[^\/]+\/(.+)/);
        let isIndexFile = /^\/(index\.html)?(\?|$)/.test(req.url);
        let pkgRoot = path.dirname(__dirname);
        let cwd = process.cwd();

        let filePath = url.parse(req.url, false).pathname;   

        let mount = cwd && !fs.existsSync(pkgRoot + filePath) ? cwd : pkgRoot;
        if (githubUrl) {
          addSecurityHeaders(req, res, false);
           // Serve the file out of the current working directory
          send(req, githubUrl[1], {root: cwd})
           .pipe(res);
          return;
        }
        addSecurityHeaders(req, res, isIndexFile);
        if (argv.debug) {
          console.debug("Serving with root directory %s", mount);
          let file = `${pkgRoot}/index.html`;
          fs.access(file, fs.constants.R_OK, (err) => {
            if (err) console.error(`${file} is not readable`);
          });
        }

        // Otherwise serve the file from the directory this module is in
        send(req, filePath, {root: mount})
          .pipe(res);
      }
      break;

    // case 'HEAD':
      // res.writeHead(200);
      // res.end();
      // exec('open -g http://localhost:' + argv.port, function(error, stdout, stderr){
        // http.request({port: argv.port})
      // });
      // break;

    case 'DELETE':
      res.setHeader('Content-Type', 'text/plain');
      res.writeHead(204, { 'Content-Type': 'text/plain' });
      io.emit('die');
      res.end('ok')
      process.exit();
      break;

    case 'PUT':
      readAllInput(req, function(body){
        writeMarkdown(body);
        res.writeHead(200);
        res.end();
      });
      break;

    default:
  }
}

io.on('connection', function(sock){
  process.stdout.write('connection established!');
  if (lastWrittenMarkdown) {
    sock.emit('newContent', lastWrittenMarkdown);  // Quick preview
    if (argv.mathjax) mathJaxRenderEmit(lastWrittenMarkdown);
  }
});


function onListening() {
  if (!argv.browser) {
    if (os.platform() === 'win32') {
      argv.browser = 'start /b';
    } else if (os.platform() === 'darwin') {
      argv.browser = 'open -g';
    } else if (os.platform() === 'android') {
		argv.browser = 'termux-open-url'
	} else { // assume unix/linux
      argv.browser = 'xdg-open';
    }
  }
  let cmd = argv.browser + ' http://localhost:' + argv.port + '/?';
  // add theme param if present
  if (argv.theme){
     cmd += 'theme=' + argv.theme;
  }

  if (argv.debug) {
    console.log("Run the following to manually open browser: \n    " + cmd);
  } else {
    exec(cmd, function(error, stdout, stderr){
      if (error) {
        console.error(`error while launching browser: ${error}`);
        throw error;
        // return;
      } else if (argv.debug) {
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      }
    });
  }
  readAllInput(process.stdin, function(body) {
    if (argv.debug) console.debug("Processing stdin -> markdown");
    writeMarkdown(body);
  });
  process.stdin.resume();
}

function onServerError(e) {
  if (e.code === 'EADDRINUSE') {
    readAllInput(process.stdin, function(body) {
      // Forward to existing instant-markdown-d server.
      require('http').request({
        hostname: 'localhost',
        port: argv.port,
        path: '/',
        method: 'PUT',
      }).end(body);
    });
    process.stdin.resume();
    return;
  }

  // Another unexpected error. Raise it again.
  throw e;
}
