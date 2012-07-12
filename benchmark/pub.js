
var ss = require('..')
  , sock = ss.socket('pub');

sock.bind(3000);
console.log('pub bound');

setInterval(function(){
  sock.send('hello');
  sock.send('hello');
  sock.send('hello');
  sock.send('hello');
  sock.send('hello');
  sock.send('hello');
}, 1);
