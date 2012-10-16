
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
});

// TODO: dont emit 3 times
var pending = 3;
pull.on('connect', function(){
  --pending || connected();
});

function connected() {
  var sa = pull.socks[0];
  var sb = pull.socks[1];
  var sc = pull.socks[2];

  assert(3 == pull.socks.length);

  sa._destroy(new Error('boom'));
  assert(2 == pull.socks.length);
  assert(sb == pull.socks[0]);
  assert(sc == pull.socks[1]);

  var err = new Error('faux EPIPE');
  err.code = 'EPIPE';
  sb._destroy(err);
  assert(1 == pull.socks.length);
  assert(sc == pull.socks[0]);
  a.close();
  b.close();
  c.close();
  pull.close();
}