
var axon = require('../..')
  , rep = axon.socket('rep');

rep.bind(3000);

rep.on('message', function(msg, reply){
  console.log('requested: %j', msg);
  reply({ goodbye: 'world' });
});