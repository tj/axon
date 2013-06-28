
var axon = require('../..')
  , sock = axon.socket('push');

sock.bind(3000);
console.log('push server started');

setInterval(function(){
  process.stdout.write('.');
  sock.send('hello');
}, 150);
