
var ss = require('../')
  , should = require('should');

var server = ss.socket('rep')
  , client = ss.socket('req');

server.bind(3000);
client.connect(3000);

server.on('message', function(msg, reply){
  msg.toString().should.equal('hey there tobi');
  reply('tobi says thanks');
});

client.on('message', function(msg){
  msg.toString().should.equal('tobi says thanks');
  client.close();
  server.close();
});

client.send('hey there tobi');