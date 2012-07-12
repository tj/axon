
var ss = require('..')
  , sock = ss.socket('pub');

sock.bind(3000);
console.log('pub bound');

function more() {
  sock.send('hello');
  sock.send('hello');
  sock.send('hello');
  sock.send('hello');
  sock.send('hello');
  sock.send('hello');
  process.nextTick(more);
}

more();