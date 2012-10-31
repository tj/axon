
var axon = require('../..')
  , req = axon.socket('req');

req.format('json');
req.connect(3000);

setInterval(function(){
  req.send({ hello: 'world' }, function(msg){
    console.log('replied: %j', msg);
  });
}, 150);