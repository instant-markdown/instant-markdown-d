var server = require('http').createServer(httpHandler),
    cp = require('child_process'),
    io = require('socket.io').listen(server),
    send = require('send'),
    converter,
    server,
    socket;

exports.start = start;
exports.convert = convert;

function convert(rawMarkup){
  var params = [rawMarkup].concat(converter.extra_params);
  socket.emit('newContent', converter.render(params));
}

function start(port, converterType, onReady){
  converter = require('./converters/' + converterType);
  server.listen(port);

  io.set('log level', 1);
  io.sockets.on('connection', function(sock){
    socket = sock;
    process.stdout.write('connection established!');
    onReady();
  });


  if (process.platform.toLowerCase().indexOf('darwin') >= 0){
    cp.exec('open -g http://localhost:' + port, function(error, stdout, stderr){});
  }
  else {  // assume unix/linux
    cp.exec('xdg-open http://localhost:' + port, function(error, stdout, stderr){});
  }
}

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
        convert(rawMarkup);
        res.writeHead(200);
        res.end();
      });
      break;

    default:
  }
}
