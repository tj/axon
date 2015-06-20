
var axon = require('..');
var should = require('should');
var assert = require('assert');

var pub = axon.socket('pub');
var sub = axon.socket('sub');

// arg type checks

var done = false;

pub.bind(4000);

setTimeout(function() {
  pub.send('foo', { bar: 'baz' }, ['some', 1], new Buffer('hello'));
}, 50);

sub.connect(4000);
sub.on('message', function(a, b, c, d){
  assert(this instanceof axon.SubSocket);
  assert('string' == typeof a);
  b.should.eql({ bar: 'baz' });
  c.should.eql(['some', 1]);
  assert(Buffer.isBuffer(d));
  assert('hello' == d.toString());

  sub.close();
  pub.close();
  done = true;
});

process.on('exit', function(){
  assert(done);
});
