
var ss = require('../')
  , should = require('should');

var server = ss.socket('rep')
  , client = ss.socket('req');

server.format('json');
client.format('json');

server.bind(3000);
client.connect(3000);

server.on('message', function(msg, reply){
  msg.should.have.property('cmd', 'hello');
  reply({
    error: null,
    result: 'thanks'
  });
});

client.on('message', function(msg){
  msg.should.have.property('error', null);
  msg.should.have.property('result', 'thanks');
  client.close();
  server.close();
});

client.send({
  cmd: 'hello'
});