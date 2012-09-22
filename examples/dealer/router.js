
var axon = require('../..')
  , sock = axon.socket('router');

sock.bind(3000);

sock.on('message', function(from, msg){
  console.log('%s said: %s', from.toString(), msg.toString());
});

setInterval(function(){
  sock.send('echo-service', 'hey tobi');
}, 500);