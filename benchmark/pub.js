
var ss = require('..')
  , sock = ss.socket('pub');

sock.bind(3000);
console.log('pub bound');

var perTick = 1;
var buf = new Buffer('hello');
console.log('sending %d byte messages', buf.length);

function more() {
  for (var i = 0; i < perTick; ++i) sock.send(buf);
  process.nextTick(more);
}

more();