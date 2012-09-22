
var axon = require('../..')
  , sock = axon.socket('req');

sock.connect(3000);

sock.on('message', function(msg){
  console.log('got: %s', msg.toString());
});

sock.send('ping');