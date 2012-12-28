
var axon = require('..')
  , assert = require('better-assert');

var pull = axon.socket('pull');

var closed = false;
var callbackClose = function() {
  closed = true;
}

pull.bind(4444, function() {
  pull.close(callbackClose);
});

pull.on('close', function() {
  setTimeout(function() {
    assert(closed === true);
  }, 100);
});