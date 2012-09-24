
var axon = require('../..')
  , sock = axon.socket('dealer');

sock.set('identity', 'echo-service');
sock.connect(3000);

sock.on('message', function(msg){
  sock.send(msg);
});