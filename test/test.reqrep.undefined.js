
var axon = require('..')
  , should = require('should')
  , req = axon.socket('req')
  , rep = axon.socket('rep')
  , assert = require('assert');

req.format('json');
rep.format('json');

req.bind(4444);
rep.connect(4444);

rep.on('message', function(obj, reply){
  reply(undefined);
});

req.send({ name: 'Tobi' }, function(res){
  assert(null === res, 'expected null');
  req.close();
  rep.close();
});