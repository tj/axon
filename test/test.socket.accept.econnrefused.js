
var axon = require('..')
  , assert = require('better-assert');

var push = axon.socket('push')
  , pull = axon.socket('pull');

push.bind(3000);
pull.connect(3000);

push.on('ignored error', function(err){
  assert('ECONNREFUSED' == err.code);
  push.close();
  pull.close();
});

push.on('connect', function(){
  var err = new Error('faux ECONNREFUSED');
  err.code = 'ECONNREFUSED';
  push.socks[0].emit('error', err);
});