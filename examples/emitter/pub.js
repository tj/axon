
var axon = require('../..')
  , sock = axon.socket('pub-emitter');

sock.bind(3000);
console.log('bound to 3000');

setInterval(function(){
  sock.emit('user:login', 'tobi');
  setTimeout(function(){
    sock.emit('user:logout', 'tobi');
  }, Math.random() * 2000);
}, 1000);