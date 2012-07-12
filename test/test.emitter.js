
var ss = require('../')
  , should = require('should');

var pub = ss.socket('emitter')
  , sub = ss.socket('emitter');

var msgs = [];

// test basic 1-1 pub/sub emitter style

pub.bind(3000, function(){
  sub.connect(3000, function(){
    sub.on('foo', function(){
      msgs.push(['foo']);
    });
    
    sub.on('bar', function(a, b, c){
      msgs.push(['bar', a, b, c]);
    });
    
    sub.on('baz', function(a){
      msgs.push(['baz', a]);
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
