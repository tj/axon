
var ss = require('../..')
  , sock = ss.socket('push');

sock.bind(3000);
console.log('push server started');

setInterval(function(){
  process.stdout.write('.');
  sock.send('hello');
}, 150);
