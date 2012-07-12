

var ss = require('..')
  , sock = ss.socket('sub');

sock.connect(3000);
console.log('sub connected');

sock.on('message', function(msg){
  console.log(msg.toString());
});