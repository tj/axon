
var axon = require('..')
  , assert = require('better-assert');

var push = axon.socket('push')
  , pull = axon.socket('pull');

pull.bind(4444);
push.connect(4444);

push.on('error', function(err){
  assert('boom' == err.message);
  push.close();
  pull.close();
});

push.on('connect', function(){
  push.socks[0]._destroy(new Error('boom'));
});