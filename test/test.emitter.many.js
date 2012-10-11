
var ss = require('..')
  , should = require('should');

var worker = ss.socket('pub-emitter')
  , relaySub = ss.socket('sub-emitter')
  , relayPub = ss.socket('pub-emitter')
  , a = ss.socket('sub-emitter')
  , b = ss.socket('sub-emitter')
  , c = ss.socket('sub-emitter')

/*

                    <--- a
  worker ---> relay <--- b 
                    <--- c

*/

relaySub.bind(3000);
relayPub.bind(4000);
worker.connect(3000);
a.connect(4000);
b.connect(4000);
c.connect(4000);

relaySub.on('progress', function(id, n){
  relayPub.emit('progress', id, n);
});

var vals = [];
var pending = 3;

a.on('progress', function(id, n){
  vals.push('a');
  id.should.equal('3d2fg');
  n.should.equal(.5);
  --pending || done();
});

b.on('progress', function(id, n){
  vals.push('b');
  id.should.equal('3d2fg');
  n.should.equal(.5);
  --pending || done();
});

c.on('progress', function(id, n){
  vals.push('c');
  id.should.equal('3d2fg');
  n.should.equal(.5);
  --pending || done();
});

setTimeout(function(){
  worker.emit('progress', '3d2fg', .5);
}, 100);

function done() {
  vals.should.include('a');
  vals.should.include('b');
  vals.should.include('c');
  vals.should.have.length(3);
  worker.close();
  relaySub.close();
  relayPub.close();
  a.close();
  b.close();
  c.close();
}