
var ss = require('../..')
  , sock = ss.socket('emitter');

sock.bind(3000);
console.log('emitter server started');

setInterval(function(){
  sock.emit('login', { name: 'tobi' });
}, 300);

setInterval(function(){
  sock.emit('logout', { name: 'tobi' });
}, 1500);
