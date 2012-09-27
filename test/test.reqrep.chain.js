
var axon = require('..')
  , should = require('should');

var req = axon.socket('req')
  , rep = axon.socket('rep')
  , req2 = axon.socket('req')
  , rep2 = axon.socket('rep');

req.bind(3000);
rep.connect(3000);

req2.bind(3001);
rep2.connect(3001);

rep.on('message', function(msg, reply){
  req2.send(msg, function(msg){
    reply('got "' + msg + '"');
  });
});

req.send('hello', function(msg){
  msg.toString().should.equal('got "HELLO"');
  req.close();
  rep.close();
  req2.close();
  rep2.close();
});

rep2.on('message', function(msg, reply){
  reply(msg.toString().toUpperCase());
});