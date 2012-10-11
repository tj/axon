
var ss = require('..')
  , program = require('commander');

program
  .option('-T, --type <name>', 'socket type [pub]', 'pub')
  .option('-t, --per-tick <n>', 'messages per tick [1000]', parseInt)
  .option('-s, --size <n>', 'message size in bytes [1024]', parseInt)
  .option('-u, --unix', 'use unix socket')
  .parse(process.argv)

if(program.unix) try { require('fs').unlinkSync('/tmp/axonbenchmark'); } catch(err) {}
var sock = ss.socket(program.type);
sock.bind(program.unix ? 'unix:///tmp/axonbenchmark' : 3000);
console.log('pub bound');

var perTick = program.perTick || 1000;
var buf = new Buffer(Array(program.size || 1024).join('a'));
console.log('sending %d per tick', perTick);
console.log('sending %d byte messages', buf.length);

function more() {
  for (var i = 0; i < perTick; ++i) sock.send(buf);
  process.nextTick(more);
}

more();