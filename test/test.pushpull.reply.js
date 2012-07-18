
var ss = require('../')
  , should = require('should');

var push = ss.socket('push')
  , pull = ss.socket('pull');

// basic 1-1 push/pull

var n = 0
  , closed;

push.bind(3000);

pull.connect(3000);
pull.on('message', function(msg, reply){
  msg.should.be.an.instanceof(Buffer);
  msg.should.have.length(3);
  msg = msg.toString();

  msg.should.equal('foo');

  reply('bar');
});

pull.on('connect', function(){
  push.send('foo');
});

push.on('message', function(msg){
  msg.should.be.an.instanceof(Buffer);

  msg.should.have.length(3);
  msg = msg.toString();

  msg.should.equal('bar');

  pull.close();
  push.close();
  closed = true;
});

process.on('exit', function(){
  should.equal(true, closed);
});