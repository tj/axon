
var axon = require('..');
var should = require('should');
var assert = require('assert');

var pub = axon.socket('pub-emitter');
var sub = axon.socket('sub-emitter');

// arg type checks

var done = false;

pub.bind(4000);

setTimeout(function() {
  pub.emit('foo', { bar: 'baz' }, ['some', 1], new Buffer('hello'));
}, 50);

sub.connect(4000);
sub.on('foo', function(a, b, c){
  assert(this instanceof axon.SubEmitterSocket);
  a.should.eql({ bar: 'baz' });
  b.should.eql(['some', 1]);
  assert(Buffer.isBuffer(c));
  assert('hello' == c.toString());

  sub.close();
  pub.close();
  done = true;
});

process.on('exit', function(){
  assert(done);
});
