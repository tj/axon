
// based on http://zguide.zeromq.org/page:all#header-50

var ss = require('../')
  , should = require('should');

var router = ss.socket('router')
  , rep = ss.socket('rep');

router.bind(3000);

rep.set('identity', 'worker-a');
rep.connect(3000);

// workload
rep.on('message', function(msg, reply){
  msg.toString().should.equal('this is the workload');
  reply('this is the reply');
});

// send the workload back after "ready"
router.on('message', function(a, b, c){
  a.toString().should.equal('worker-a');
  b.toString().should.equal('\u0000');
  c.toString().should.equal('this is the reply');
  rep.close();
  router.close();
});

setTimeout(function(){
  router.send('worker-a', '\u0000', 'this is the workload');
}, 50);



