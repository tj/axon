
var ss = require('../..')
  , sock = ss.socket('push')
  , fs = require('fs')
  , read = fs.readFileSync;

// images

var images = [
  read(__dirname + '/images/one.jpeg'),
  read(__dirname + '/images/two.jpeg'),
  read(__dirname + '/images/three.jpeg'),
];

// bind

sock.bind(3000);
console.log('producer bound to 3000');

// send random images

setInterval(function(){
  var img = images[Math.random() * images.length | 0];
  console.log('sending %dkb image', img.length / 1024 | 0);
  sock.send(img);
}, 200);
