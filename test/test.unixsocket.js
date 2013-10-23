
var axon = require('..')
  , should = require('should');

var req = axon.socket('req')
  , rep = axon.socket('rep');

var socketPath = "unix://" + process.cwd() + "/test.sock";

req.bind(socketPath);
rep.connect(socketPath);

rep.on('message', function(msg, reply){
  reply('got "' + msg + '"');
});

req.send('hello', function(msg){
  msg.toString().should.equal('got "hello"');
  req.close();
  rep.close();
});