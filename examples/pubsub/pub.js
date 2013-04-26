
var axon = require('../..')
  , sock = axon.socket('pub');

sock.bind(3000);
console.log('pub server started');

setInterval(function(){
  console.log('sending');
  sock.send('hello');
}, 500);
