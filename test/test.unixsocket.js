
var axon = require('..')
  , should = require('should');

var req = axon.socket('req')
  , rep = axon.socket('rep');

var path = 'unix://' + process.cwd() + '/test.sock'
var bound = false;

rep.connect(path);
req.bind(path, function(){
  bound = true;
});

rep.on('message', function(msg, reply){
  reply('got "' + msg + '"');
});

req.send('hello', function(msg){
  msg.toString().should.equal('got "hello"');
  bound.should.equal(true);
  req.close();
  rep.close();
});
