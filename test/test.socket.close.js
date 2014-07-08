
var axon = require('..')
  , assert = require('better-assert');

var pull = axon.socket('pull');
var push = axon.socket('push');
var closed = false;
var msgs = [];

pull.bind(4000, function(){
  push.connect(4000);
});

push.on('connect', function(){
  push.send('a');
  push.send('b');
  push.send('c');
  push.close(function(){
    closed = true;
    assert('abc' == msgs.join(''));
    pull.close();
  });
});

pull.on('message', function(msg){
  msgs.push(msg);
});

pull.on('close', function(){
  assert(closed);
});
