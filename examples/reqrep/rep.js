
var axon = require('../..')
  , sock = axon.socket('rep');

sock.bind(3000);

sock.on('message', function(msg, reply){
  console.log('got: %s', msg.toString());
  reply('pong');
});