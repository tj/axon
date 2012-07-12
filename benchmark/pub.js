
var ss = require('..')
  , sock = ss.socket('pub');

sock.bind(3000);
console.log('pub bound');

var perTick = 100;
var buf = new Buffer('a');

function more() {
  for (var i = 0; i < perTick; ++i) sock.send(buf);
  process.nextTick(more);
}

more();