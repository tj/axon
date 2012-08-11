
var ss = require('../')
  , should = require('should');

var router = ss.socket('router')
  , worker = ss.socket('stream');

worker.set('identity', 'myworker');
worker.connect(3000);

worker.on('message', function(msg){
  msg.toString().should.equal('hey there tobi');
  worker.close();
  router.close();
});

router.set('identity', 'myrouter');
router.bind(3000);

setTimeout(function(){
  router.send('myworker', 'hey there tobi');
}, 250);