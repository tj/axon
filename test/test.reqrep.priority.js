
var axon = require('..')
  , should = require('should');

var req = axon.socket('req', { priority : true })
  , rep1 = axon.socket('rep')
  , rep2 = axon.socket('rep');

var count1 = 0;
var count2 = 0;

var msgCount = 10;
var seen = 0;

req.bind(4000);
rep1.connect(4000);
rep2.connect(4000);

rep1.on('message', function(msg, reply){
  setTimeout(function () {
    count1++;
    reply('got "' + msg + '"');
  }, 1200);
});

rep2.on('message', function(msg, reply){
  setTimeout(function () {
    count2++;
    reply('got "' + msg + '"');
  }, 9000);
});

var interId = setInterval(function () {
  req.send('hello', function(msg){
    msg.toString().should.equal('got "hello"');
    seen++;
    if (seen == msgCount) {
      clearInterval(interId);
      done();
    }
  });
}, 2000);

function done() {
  count1.should.equal(8);
  count2.should.equal(2);
  rep1.close();
  rep2.close();
  req.close();
}
