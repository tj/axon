
var ss = require('../')
  , should = require('should');

var pub = ss.socket('pub')
  , sub = ss.socket('sub');

var n = 0
  , closed;

// test basic 1-1 pub/sub

pub.bind(3000, function(){
  sub.connect(3000, function(){
    sub.on('message', function(msg){
      msg.should.be.an.instanceof(Buffer);
      msg.should.have.length(3);
      msg = msg.toString();
      switch (n++) {
        case 0:
          msg.should.equal('foo');
          break;
        case 1:
          msg.should.equal('bar');
          break;
        case 2:
          msg.should.equal('baz');
          pub.close();
          sub.close();
          closed = true;
          break;
      }
    });

    setTimeout(function(){
      pub.send('foo');
      pub.send('bar');
      pub.send('baz');
    }, 20);
  });
});

process.on('exit', function(){
  should.equal(true, closed);
});