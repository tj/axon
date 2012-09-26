
var axon = require('..')
  , should = require('should');

var req = axon.socket('req')
  , rep = axon.socket('rep');

req.bind(3000);
rep.connect(3000);

rep.on('message', function(msg, reply){
  reply('got "' + msg + '"');
});

req.send('hello', function(msg){
  msg.toString().should.equal('got "hello"');
  req.close();
  rep.close();
});