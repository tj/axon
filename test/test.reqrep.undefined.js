
var axon = require('..')
  , should = require('should')
  , req = axon.socket('req')
  , rep = axon.socket('rep')
  , assert = require('assert');

req.format('json');
rep.format('json');

req.bind(3000);
rep.connect(3000);

rep.on('message', function(obj, reply){
  reply(undefined);
});

req.send({ name: 'Tobi' }, function(res){
  assert(null === res, 'expected null');
  req.close();
  rep.close();
});