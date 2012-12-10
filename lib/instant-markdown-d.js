var server = require('http').createServer(httpHandler),
    exec = require('child_process').exec,
    io = require('socket.io').listen(server),
    send = require('send'),
    converter = require('./gfm_converter'),
    server,
    socket;

module.exports = instantMarkdownServer;

function instantMarkdownServer(){

  instantMarkdownServer.start(port, onReady){
    server.listen(8090);

    function httpHandler(req, res) {
      switch(req.method)
      {
        case 'GET':
          // Example: /my-repo/raw/master/sub-dir/some.png
          var githubUrl = req.url.match(/\/[^\/]+\/raw\/[^\/]+\/(.+)/);
          if (githubUrl) {
             // Serve the file out of the current working directory
            send(req, githubUrl[1])
             .root(process.cwd())
             .pipe(res);
            return;
          }

          // Otherwise serve the file from the directory this module is in
          send(req, req.url)
            .root(__dirname)
            .pipe(res);
          break;

        case 'DELETE':
          socket.emit('die');
          process.exit();
          break;

        case 'PUT':
          var rawMarkup = '';
          req.on('data', function(chunk){
            rawMarkup += chunk;
          });
          req.on('end', function(){
            socket.emit('newContent', converter.render(rawMarkup));
            res.writeHead(200);
            res.end();
          });
          break;

        default:
      }
    }

    io.set('log level', 1);
    io.sockets.on('connection', function(sock){
      socket = sock;
      process.stdout.write('connection established!');
      onReady();
    });


    if (process.platform.toLowerCase().indexOf('darwin') >= 0){
      exec('open -g http://localhost:8090', function(error, stdout, stderr){});
    }
    else {  // assume unix/linux
      exec('xdg-open http://localhost:8090', function(error, stdout, stderr){});
    }
  }
}
