
var axon = require('..')
  , assert = require('better-assert');

var pull = axon.socket('pull');

var closed = false;

pull.bind(4444, function(){
  pull.close(function(){
    closed = true;
  });
});

pull.on('close', function(){
  setTimeout(function(){
    assert(closed);
  }, 100);
});
