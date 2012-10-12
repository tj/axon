
var ss = require('..')
  , should = require('should');

var worker = ss.socket('pub-emitter')
  , a = ss.socket('sub-emitter')
  , b = ss.socket('sub-emitter')
  , c = ss.socket('sub-emitter')

/*

            +--> a
  worker ---|--> b 
            +--> c

*/

worker.connect(3000);
worker.connect(3001);
worker.connect(3002);
a.bind(3000);
b.bind(3001);
c.bind(3002);

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
  a.close();
  b.close();
  c.close();
}