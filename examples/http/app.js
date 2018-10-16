
/**
 * Module dependencies.
 */

var axon = require('../..')
  , sock = axon.socket('rep');

// First, node http/server.js
// with debug console logging, DEBUG=axon:* node http/server.js
// Then, try $ curl -d '{"foo":"bar"}' http://localhost:3000/

sock.on('message', function(msg, reply){
  console.log('%s %s', msg.url, msg.method);
  reply({
    header: { 'content-type': 'text/plain' },
    status: 200,
    body: 'thanks!'
  })
});

sock.connect(4000);
console.log('connected to 4000');
