
var ss = require('..')
  , program = require('commander')
  , humanize = require('humanize-number');

program
  .option('-T, --type <name>', 'socket type [sub]', 'sub')
  .option('-s, --size <n>', 'message size in bytes [1024]', parseInt)
  .parse(process.argv)

var sock = ss.socket(program.type);
sock.connect(3000);

var n = 0;
var ops = 5000;
var bytes = program.size || 1024;
var prev = start = Date.now();
var results = [];

console.log();

sock.on('message', function(msg){
  if (n++ % ops == 0) {
    var ms = Date.now() - prev;
    var sec = ms / 1000;
    var persec = ops / sec | 0;
    results.push(persec);
    process.stdout.write('\r  [' + persec + ' ops/s] [' + n + ']');
    prev = Date.now();
  }
});

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
  var ms = Date.now() - start;
  var avg = mean(results);
  console.log('\n');
  console.log('      min: %d ops/s', min(results));
  console.log('     mean: %d ops/s', avg);
  console.log('   median: %d ops/s', median(results));
  console.log('    total: %d ops in %ds', n, ms / 1000);
  console.log('  through: %d mb/s', ((avg * bytes) / 1024 / 1024).toFixed(2));
  console.log();
  process.exit();
});