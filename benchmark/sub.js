

var ss = require('..')
  , sock = ss.socket('sub');

sock.connect(3000);

var n = 0;
var ops = 200;
var t = process.hrtime();

sock.on('message', function(msg){
  if (n++ % ops == 0) {
    t = process.hrtime(t);
    var ms = t[1] / 1000 / 1000;
    process.stdout.write('\r  [' + (ops * (1000 / ms) | 0) + ' ops/s] [' + n + ']');
    t = process.hrtime();
  }
});