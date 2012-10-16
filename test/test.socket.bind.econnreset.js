
var axon = require('..')
  , assert = require('better-assert');

var push = axon.socket('push')
  , pull = axon.socket('pull');

push.bind(3000);
pull.connect(3000);

pull.on('message', function(msg){
  assert('hello' == msg.toString());
  push.close();
  pull.close();
});

push.on('ignored error', function(err){
  assert('ECONNRESET' == err.code);
  push.send('hello');
});

push.on('connect', function(){
  var err = new Error('faux ECONNRESET');
  err.code = 'ECONNRESET';
  push.socks[0].emit('error', err);
});