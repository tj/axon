
var ss = require('../')
  , should = require('should');

// multiple pushers

var pusher1 = ss.socket('push');
var pusher2 = ss.socket('push');
var pusher3 = ss.socket('push');

pusher1.bind(3000);
pusher2.bind(3001);
pusher3.bind(3002);

pusher1.send('hey');
pusher2.send('hey');
pusher3.send('hey');

// one puller that connects to many pushers

var pull = ss.socket('pull');

pull.connect(3000);
pull.connect(3001);
pull.connect(3002);

var msgs = [];

pull.on('message', function(msg){
  var n = msgs.push(msg.toString());
  if (n == 3) {
    msgs.join(' ').should.equal('hey hey hey');
    pusher1.close();
    pusher2.close();
    pusher3.close();
    pull.close();
  }
});
