
var ss = require('../..')
  , sock = ss.socket('emitter');

sock.connect(3000);
console.log('emitter client connected');

sock.on('login', function(user){
  console.log('%s signed in', user.name);
});

sock.on('logout', function(user){
  console.log('%s signed out', user.name);
});