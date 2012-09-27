
var axon = require('..')
  , should = require('should')
  , req = axon.socket('req')
  , rep = axon.socket('rep');

req.format('json');
rep.format('json');

req.bind(3000);
rep.connect(3000);

rep.on('message', function(obj, reply){
  reply({ name: obj.name });
});

req.send({ name: 'Tobi' }, function(res){
  res.should.eql({ name: 'Tobi' });
  req.close();
  rep.close();
});