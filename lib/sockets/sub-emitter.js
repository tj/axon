
/**
 * Module dependencies.
 */

var SubSocket = require('./sub');

/**
 * Expose `SubEmitterSocket`.
 */

module.exports = SubEmitterSocket;

/**
 * Initialzie a new `SubEmitterSocket`.
 *
 * @api private
 */

function SubEmitterSocket() { 
  this.sock = new SubSocket;
  this.sock.format('json');
  this.sock.onmessage = this.onmessage.bind(this);
  this.listeners = [];
}

/**
 * Message handler.
 *
 * @param {net.Socket} sock
 * @return {Function} closure(msg, mulitpart)
 * @api private
 */

SubEmitterSocket.prototype.onmessage = function(){
  var self = this;
  var listeners = this.listeners;

  return function(msg, multipart){
    var topic = multipart
      ? msg[0].toString()
      : msg.toString();

    for (var i = 0; i < listeners.length; ++i) {
      var listener = listeners[i];
      var m = listener.re.exec(topic);
      if (!m) continue;
      if (multipart) {
        listener.fn.apply(this, m.slice(1).concat(msg.slice(1)));
      } else {
        listener.fn.apply(this, m.slice(1));
      }
    }
  }
};

/**
 * Subscribe to `event` and invoke the given callback `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {SubEmitterSocket} self
 * @api public
 */

SubEmitterSocket.prototype.on = function(event, fn){
  var re = this.sock.subscribe(event);
  this.listeners.push({
    event: event,
    re: re,
    fn: fn
  });
  return this;
};

/**
 * Bind, see `Socket#bind()`.
 *
 * @api public
 */

SubEmitterSocket.prototype.bind = function(){
  return this.sock.bind.apply(this.sock, arguments);
};

/**
 * Connect, see `Socket#connect()`.
 *
 * @api public
 */

SubEmitterSocket.prototype.connect = function(){
  return this.sock.connect.apply(this.sock, arguments);
};

/**
 * Close the sub socket.
 *
 * @api public
 */

SubEmitterSocket.prototype.close = function(){
  return this.sock.close();
};
