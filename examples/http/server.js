
/**
 * Module dependencies.
 */

var axon = require('../..')
  , http = require('http')

// http server

var server = http.createServer(function(req, res){
  var buf = '';

  // buffer body for this example
  req.on('data', function(chunk){ buf += chunk });
  req.on('end', function(){
    // construct json message
    var msg = {
      url: req.url,
      method: req.method,
      header: req.headers,
      body: buf
    };

    // distribute between N ./app nodes
    sock.send(msg, function(msg){
      res.statusCode = msg.status;
      Object.keys(msg.header).forEach(function(field){
        res.setHeader(field, msg.header[field]);
      });
      res.end(msg.body);
    });

  });
}).listen(3000);

// socket

var sock = axon.socket('req');
sock.format('json');
sock.bind(4000);

console.log('listening on port 3000');