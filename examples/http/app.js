
/**
 * Module dependencies.
 */

var axon = require('../..')
  , sock = axon.socket('rep');

// try $ curl -d '{"foo":"bar"}' http://localhost:3000/

sock.on('message', function(msg, reply){
  console.log('%s %s', msg.url, msg.method);
  switch (msg.url) {
    case '/':
      reply({
        header: { 'content-type': 'text/plain' },
        status: 200,
        body: 'thanks!'
      })
      break;
  }
});

sock.format('json');
sock.connect(4000);
console.log('connected to 4000');