
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

worker.connect(4444);
worker.connect(4445);
worker.connect(4446);
a.bind(4444);
b.bind(4445);
c.bind(4446);

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