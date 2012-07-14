
// $ npm install resize

var ss = require('../..')
  , sock = ss.socket('pull')
  , sink = ss.socket('push')
  , resize = require('resize')
  , fs = require('fs');

// connect

sock.connect(3000);
sink.connect(3001);
console.log('consumer connected to 3000');

// resize

sock.on('message', function(img){
  console.log('resizing %dkb image', img.length / 1024 | 0);
  resize(img, 100, 100, function(err, buf){
    if (err) throw err;
    // ^ dont do this
    sink.send(buf);
  });
});