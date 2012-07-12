
var ss = require('../..')
  , sock = ss.socket('pull');

sock.connect(3000);

sock.on('message', function(msg){
  console.log(msg.toString());
});