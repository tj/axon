
var axon = require('../..');

// foo service

var foo = axon.socket('rep');

foo.set('identity', 'foo');
foo.connect(3000);

foo.on('message', function(msg, reply){
  reply('foo says: pong');
});

// bar service

var bar = axon.socket('rep');

bar.set('identity', 'bar');
bar.connect(3000);

bar.on('message', function(msg, reply){
  reply('bar says: pong');
});