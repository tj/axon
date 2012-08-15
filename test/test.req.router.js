
// based on http://zguide.zeromq.org/page:all#header-49

var ss = require('../')
  , should = require('should');

var router = ss.socket('router')
  , worker = ss.socket('req');

router.bind(3000);

worker.set('identity', 'worker-a');
worker.connect(3000);

// workload
worker.on('message', function(msg){
  msg.toString().should.equal('this is the workload');
  router.close();
  worker.close();
});

// send the workload back after "ready"
router.on('message', function(addr, delimeter, msg){
  addr.toString().should.equal('worker-a');
  delimeter.toString().should.equal('\u0000');
  msg.toString().should.equal('ready');
  router.send(addr, delimeter, "this is the workload");
});

// worker tells router were ready
worker.send('ready');



