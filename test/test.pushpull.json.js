
var ss = require('../')
  , should = require('should');

var push = ss.socket('push')
  , pull = ss.socket('pull');

// basic 1-1 push/pull

var n = 0;

push.bind(4444);

push.format('json');
push.send({ path: '/tmp/foo.png' });
push.send({ path: '/tmp/bar.png' });
push.send({ path: '/tmp/baz.png' });

var strs = ['foo', 'bar', 'baz'];

pull.connect(4444);
pull.on('message', function(msg){
  msg.should.have.property('path', '/tmp/' + strs[n++] + '.png');
  if (n == 3) {
    push.close();
    pull.close();
  }
});