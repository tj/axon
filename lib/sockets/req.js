
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
  this.n = 0;
  this.pid = process.pid;
  this.ids = 0;
  this.callbacks = {};
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
    var id = msg.shift();
    msg.shift();
    var fn = self.callbacks[id];
    if (!fn) return debug('missing callback %s', id);
    fn.apply(null, msg);
    delete self.callbacks[id];
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
  var socks = this.socks
    , len = socks.length
    , sock = socks[this.n++ % len]
    , args = [];

  if (Array.isArray(msg)) {
    args = msg;
  } else {
    for (var i = 0; i < arguments.length; ++i) {
      args[i] = arguments[i];
    }
  }

  if (sock) {
    if ('function' == typeof args[args.length - 1]) {
      var fn = args.pop();
      fn.id = this.pid + ':' + this.ids++;
      this.callbacks[fn.id] = fn;
      args.unshift(fn.id, '\u0000');
    }
  }

  if (sock) {
    sock.write(this.pack(args));
  } else {
    debug('no connected peers');
    this.enqueue(args);
  }
};