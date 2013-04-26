
var axon = require('../..')
  , sock = axon.socket('pull');

sock.connect(3000);

sock.on('message', function(msg){
  console.log(msg.toString());
});