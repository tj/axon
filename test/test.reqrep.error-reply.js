
var axon = require('..')
  , assert = require('better-assert');

var req = axon.socket('req')
  , rep = axon.socket('rep');

rep.bind(4444);
req.connect(4444);

rep.on('message', function(msg, reply){
  setTimeout(function(){
    assert(reply('ok') === false);
    rep.close();
  }, 50);
});


req.on('connect', function(){
  req.send('hi', function(){});
  setTimeout(function(){
    req.close();
  }, 25);
});