
var ss = require('../..')
  , sock = ss.socket('pull')
  , fs = require('fs');

// bind

sock.bind(3001);
console.log('sink bound to 3001');

// save images

sock.on('message', function(img){
  var path = '/tmp/' + (Math.random() * 0xffffff | 0) + '.png';
  fs.writeFile(path, img, function(err){
    if (err) throw err;
    // ^ dont do this
    console.log('saved %s', path);
  });
});