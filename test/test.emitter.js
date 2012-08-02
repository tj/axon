
var ss = require('../')
  , should = require('should');

var pub = ss.socket('emitter')
  , sub = ss.socket('emitter');

// test basic 1-1 pub/sub emitter style

pub.bind(3000, function(){
  sub.connect(3000, function(){
    sub.on('foo', function(){
      arguments.length.should.equal(0);
    });

    sub.on('bar', function(a, b, c){
      arguments.length.should.equal(3);
      a.should.equal(1);
      b.should.equal(2);
      c.should.equal(3);
    });

    sub.on('baz', function(a){
      arguments.length.should.equal(1);
      a.should.have.property('name', 'tobi');
      pub.close();
      sub.close();
    });

    setTimeout(function(){
      pub.emit('foo');
      pub.emit('bar', 1, 2, 3);
      pub.emit('baz', { name: 'tobi' });
    }, 20);
  });
});
