
var zmq = require('..')
  , sub = zmq.socket('sub');

var start = new Date
  , n = 1000
  , ops = n;

sub.on('message', function(msg){
  console.error(msg);
  --n || (function(){
    var duration = new Date - start;
    pub.close();
    sub.close();
    console.log();
    console.log('  pub/sub:');
    console.log('    \033[36m%d\033[m msgs', ops);
    console.log('    \033[36m%d\033[m ops/s', ops / (duration / 1000) | 0);
    console.log('    \033[36m%d\033[m ms', duration);
    console.log();
  })();
});

sub.connect(3000, function(){
  console.log('connected to :3000');
});
