
var ss = require('..')
  , program = require('commander');

program
  .option('-T, --type <name>', 'socket type [sub]', 'sub')
  .option('-s, --size <n>', 'message size in bytes [1024]', parseInt)
  .parse(process.argv)

var sock = ss.socket(program.type);
sock.connect(3000);

var n = 0;
var ops = 200;
var bytes = program.size || 1024;
var t = start = process.hrtime();
var results = [];

console.log();

sock.on('message', function(msg){
  if (n++ % ops == 0) {
    t = process.hrtime(t);
    var persec = (ops / hrToSec(t)) | 0;
    results.push(persec);
    process.stdout.write('\r  [' + persec + ' ops/s] [' + n + ']');
    t = process.hrtime();
  }
});

function hrToSec(t) {
  return t[0] + t[1] / 1e9;
}

function numberFormat(n, m) {
  var e = Math.pow(10, m);
  return Math.round(n * e) / e;
}

function sum(arr) {
  return arr.reduce(function(sum, n){
    return sum + n;
  });
}

function min(arr) {
  return arr.reduce(function(min, n){
    return n < min
      ? n
      : min;
  });
}

function mean(arr) {
  return sum(arr) / arr.length | 0;
}

function median(arr) {
  arr = arr.sort();
  return arr[arr.length / 2 | 0];
}

process.on('SIGINT', function(){
  t = process.hrtime(start);
  var sec = hrToSec(t);
  var avg = n / sec;
  console.log('\n');
  console.log('      min: %d ops/s', min(results));
  console.log('     mean: %d ops/s', numberFormat(avg, 3));
  console.log('   median: %d ops/s', median(results));
  console.log('    total: %d ops in %ds', n, numberFormat(sec, 3));
  console.log('  through: %d mb/s', numberFormat(avg * bytes / 1024 / 1024, 3));
  console.log();
  process.exit();
});