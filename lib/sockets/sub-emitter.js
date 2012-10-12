
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
  this.sock.on('message', this.onmessage.bind(this));
  this.listeners = [];
}

/**
 * Invoke listeners for event `type`.
 *
 * @param {String} type
 * @api private
 */

SubEmitterSocket.prototype.onmessage = function(type){
  var args = [].slice.call(arguments, 1);
  for (var i = 0; i < this.listeners.length; ++i) {
    var listener = this.listeners[i];
    var m = listener.re.exec(type);
    if (!m) continue;
    listener.fn.apply(this, m.slice(1).concat(args));
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
