
var axon = require('../..')
  , sock = axon.socket('sub-emitter');

sock.connect(3000);
console.log('connected to 3000');

sock.on('user:login', function(user){
  console.log('user %s logged in', user);
});

sock.on('user:*', function(action, user){
  console.log('user %s %s', user, action);
});

sock.on('*', function(event, user){
  console.log('got event %s %j', event, [].slice.call(arguments, 1));
  console.log();
});