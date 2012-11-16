
var axon = require('..')
  , assert = require('better-assert');

var push = axon.socket('push')
  , pull = axon.socket('pull');

push.bind(4444);
pull.connect(4444);

push.on('ignored error', function(err){
  assert('ECONNRESET' == err.code);
  push.close();
  pull.close();
});

push.on('connect', function(){
  var err = new Error('faux ECONNRESET');
  err.code = 'ECONNRESET';
  push.socks[0]._destroy(err);
});