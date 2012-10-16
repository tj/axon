
var axon = require('..')
  , assert = require('better-assert');

var a = axon.socket('push')
  , b = axon.socket('push')
  , c = axon.socket('push')
  , pull = axon.socket('pull')

a.bind(3001);
b.bind(3002);
c.bind(3003);
pull.connect(3001);
pull.connect(3002);
pull.connect(3003);

pull.on('error', function(err){
  assert('boom' == err.message);
  assert(2 == pull.socks.length);
  var err = new Error('faux EPIPE');
  err.code = 'EPIPE';
  pull.socks[0]._destroy(err);
});

pull.on('ignored error', function(err){
  assert('EPIPE' == err.code);
  assert(1 == pull.socks.length);
  c.close();
  pull.close();
});

var pending = 3;
pull.on('connect', function(){
  --pending || connected();
});

function connected() {
  assert(3 == pull.socks.length);
  pull.socks[0]._destroy(new Error('boom'));
}