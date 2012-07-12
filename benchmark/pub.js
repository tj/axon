
var zmq = require('..')
  , pub = zmq.socket('pub');

var n = 1000;

pub.bind(3000, function(){
  console.log('bound to :3000');
  while (n--) pub.send('foo');
});
