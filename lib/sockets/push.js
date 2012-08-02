
/**
 * Module dependencies.
 */

var Queue = require('./queue');

/**
 * Expose `PushSocket`.
 */

module.exports = PushSocket;

/**
 * Initialzie a new `PushSocket`.
 *
 * @api private
 */

function PushSocket() {
  Queue.call(this);
  this.n = 0;
  this.on('connection', this.flush.bind(this));
}

/**
 * Inherits from `Queue.prototype`.
 */

PushSocket.prototype.__proto__ = Queue.prototype;

/**
 * Send `msg` to all established peers.
 *
 * @param {Mixed} msg
 * @api private
 */

PushSocket.prototype.sendToPeers = function(msg){
  var socks = this.socks
    , len = socks.length
    , sock = socks[this.n++ % len];

  if (sock) {
    sock.write(this.pack(msg));
  } else {
    this.buf.push(msg);
  }
};

/**
 * Send `msg` to established peer.
 *
 * @param {Mixed} msg
 * @api private
 */

PushSocket.prototype.sendToPeer = function(msg){
  var sock = this.sock;

  if (sock) {
    sock.write(this.pack(msg));
  } else {
    this.buf.push(msg);
  }
};

/**
 * Send `msg` round-robin to established peers.
 *
 * @param {Mixed} msg
 * @api public
 */

PushSocket.prototype.send = function(msg){
  if ('server' == this.type) this.sendToPeers(msg);
  else this.sendToPeer(msg);
};