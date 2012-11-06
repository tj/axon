
var ss = require('..')
  , program = require('commander');

program
  .option('-T, --type <name>', 'socket type [pub]', 'pub')
  .option('-t, --per-tick <n>', 'messages per tick [1000]', parseInt)
  .option('-s, --size <n>', 'message size in bytes [1024]', parseInt)
  .parse(process.argv)

var sock = ss.socket(program.type);
sock.bind(3000);
console.log('pub bound');

var perTick = program.perTick || 1000;
var buf = new Buffer(program.size || 1024)
buf.fill('a');
console.log('sending %d per tick', perTick);
console.log('sending %d byte messages', buf.length);

function more() {
  for (var i = 0; i < perTick; ++i) sock.send(buf);
  process.nextTick(more);
}

more();