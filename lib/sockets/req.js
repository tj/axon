
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , queue = require('../plugins/queue')
  , debug = require('debug')('axon:req');


/**
 * Expose `ReqSocket`.
 */

module.exports = ReqSocket;

/**
 * Initialize a new `ReqSocket`.
 *
 * @api private
 */

function ReqSocket() {
  Socket.call(this);
  this.use(queue());
}

/**
 * Inherits from `Socket.prototype`.
 */

ReqSocket.prototype.__proto__ = Socket.prototype;

/**
 * Emits the "message" event with all message parts
 * after the null delimeter part.
 *
 * @param {net.Socket} sock
 * @return {Function} closure(msg, multipart)
 * @api private
 */

ReqSocket.prototype.onmessage = function(){
  var self = this;
  return function(msg, multipart){
    if (!multipart) return debug('expected multipart');
    if (0x00 !== msg[0][0]) return debug('malformed message');
    self.emit.apply(self, ['message'].concat(msg.slice(1)));
  };
};

/**
 * Sends `msg` to the remote peers. Appends
 * the null message part prior to sending.
 *
 * @param {Mixed} msg
 * @api public
 */

ReqSocket.prototype.send = function(msg){
  var sock = this.socks[0]
    , args = [];

  if (Array.isArray(msg)) {
    args = msg;
  } else {
    for (var i = 0; i < arguments.length; ++i) {
      args[i] = arguments[i];
    }
  }

  if (sock) {
    sock.write(this.pack(['\u0000'].concat(args)));
  } else {
    debug('no connected peers');
    this.enqueue(msg);
  }
};