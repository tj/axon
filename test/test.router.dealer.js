
// http://zguide.zeromq.org/page:all#header-48

var ss = require('../')
  , should = require('should');

var router = ss.socket('router')
  , workerA = ss.socket('dealer')
  , workerB = ss.socket('dealer');

router.bind(3000);

workerA.set('identity', 'worker-a');
workerA.connect(3000);

workerB.set('identity', 'worker-b');
workerB.connect(3000);

var n = 0;

router.on('message', function(from, body){
  from = from.toString();
  body = body.toString();

  n += 1;

  if ('worker-a' == from) {
    body.should.equal('worker-a says hey');
  } else {
    body.should.equal('worker-b says hey');
  }

  if (2 === n) {
    workerA.close();
    workerB.close();
    router.close();
  }
});

workerA.on('message', function(msg){
  msg.toString().should.be.equal('hello worker-a');
  workerA.send('worker-a says hey');
});

workerB.on('message', function(msg){
  msg.toString().should.be.equal('hello worker-b');
  workerB.send('worker-b says hey');
});

setTimeout(function(){
  router.send('worker-a', 'hello worker-a');
  router.send('worker-b', 'hello worker-b');
}, 50);

