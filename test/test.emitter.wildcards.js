
var axon = require('..')
  , assert = require('better-assert')
  , pub = axon.socket('pub-emitter')
  , sub = axon.socket('sub-emitter')
  , pending = 6

pub.bind(3000);

sub.on('user:login', function(name){
  assert('tobi' == name);
  --pending || done();
});

sub.on('user:logout', function(name){
  assert('tobi' == name);
  --pending || done();
});

sub.on('user:*', function(action, name){
  assert('login' == action || 'logout' == action);
  assert('tobi' == name);
  --pending || done();
});

sub.on('*:*', function(topic, action, name){
  assert('user' == topic);
  assert('login' == action || 'logout' == action);
  assert('tobi' == name);
  --pending || done();
});

sub.connect(3000, function(){
  pub.emit('user:login', 'tobi');
  pub.emit('user:logout', 'tobi');
});

function done() {
  sub.close();
  pub.close();
}