
// Issue 38 -- https://github.com/visionmedia/axon/issues/38

var ss = require('../')
  , should = require('should');

var server = ss.socket('emitter')
  , client = ss.socket('emitter')
  , relay = ss.socket('emitter')
  , destination = ss.socket('emitter');

server.bind(9000);
client.connect(9000);

relay.bind(9010);
destination.connect(9010);

// arguments
server.on('ping', function(value){
  value.should.equal('PING!');
  relay.send('pong');
});

// no arguments
destination.on('pong', function(){
  arguments.should.have.length(0);
  server.close();
  client.close();
  relay.close();
  destination.close();
});

// start the chain
client.on('connect', function(){
  client.send('ping', 'PING!');
});