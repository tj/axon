
var ss = require('..')
  , sock = ss.socket('pub')
  , program = require('commander');

program
  .option('-t, --per-tick <n>', 'messages per tick [1000]', parseInt)
  .option('-s, --size <n>', 'message sizein bytes [1024]', parseInt)
  .parse(process.argv)

sock.bind(3000);
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