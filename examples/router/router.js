
var axon = require('../..')
  , sock = axon.socket('router');

sock.bind(3000);

sock.on('message', function(from, delim, msg){
  console.log(msg.toString());
});

setInterval(function(){
  sock.send('foo', '\u0000', 'hello foo');
  sock.send('bar', '\u0000', 'hello bar');
}, 500);