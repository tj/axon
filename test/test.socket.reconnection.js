
var ss = require('../')
  , should = require('should')
  , assert = require('assert');

var push = ss.socket('push')
  , pull = ss.socket('pull');

// basic 1-1 push/pull

var msgs = []
  , n = 0;

push.bind(3000);
pull.connect(3000);

var id = setInterval(function(){
  push.send(String(n++));
}, 1);

pull.on('message', function(msg){
  msgs.push(msg.toString());

  switch (msgs.length) {
    case 10:
      pull.close();
      pull.on('close', function(){
        pull.removeAllListeners('close');
        pull.connect(3000);
      });
      break;
    case 300:
      for (var i = 0; i < 299; ++i) {
        msgs[i].should.equal(i.toString());
      }

      clearInterval(id);

      push.close();
      pull.close();
      break;
  }
});