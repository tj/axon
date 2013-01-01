
var axon = require('../..')
  , push = axon.socket('push')
  , pull = axon.socket('pull')

// by default the high water mark (HWM)
// is Infinity, allowing the queue to
// grow unbounded. Here it is manually
// set to 20 for demonstration purposes

push.connect(3000);
push.set('hwm', 20);

// the receiver (pull socket) periodically
// unbinds to simulate a poor client

setInterval(function(){
  console.log('unbind');
  pull.close();
  setTimeout(function(){
    console.log('bind');
    pull.bind(3000);
  }, 250);
}, 2000);

// send more messages than
// the client can handle

var id = 0;
setInterval(function(){
  push.send(String(++id));
}, 10);

// received messasges

pull.on('message', function(msg){
  console.log('recv %s', msg);
});

// dropped messages

push.on('drop', function(msg){
  console.log('drop %s', msg);
});

// flushed messages

push.on('flush', function(msgs){
  console.log('flush %d msgs', msgs.length);
});
