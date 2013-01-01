
var axon = require('../..')
  , push = axon.socket('push')
  , pull = axon.socket('pull')

// by default the high water mark (HWM)
// is Infinity, allowing the queue to
// grow unbounded. Here it is manually
// set to 3 for demonstration purposes only

push.connect(3000);
push.set('hwm', 3);

// faux database as intermediate queue,
// this could be mongo, disk, anything you want

var db = [];
push.on('drop', function(msg){
  console.log('dropped %s', msg);
  db.push(msg);
});

push.on('flush', function(msgs){
  console.log('flushed %d', msgs.length);
  db.forEach(function(msg){
    push.send(msg);
  });
});

pull.on('message', function(msg){
  console.log('recv %s', msg);
});

pull.bind(3000, function(){
  push.send('1');
  push.send('2');
  push.send('3');
  push.send('4');
  push.send('5');
  pull.close(function(){
    push.send('6');
    push.send('7');
    push.send('8');
    push.send('9');
    push.send('10');
    pull.bind(3000);
  });
});
