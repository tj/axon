
/**
 * Module dependencies.
 */

var net = require('net')
  , Emitter = require('events').EventEmitter;

/**
 * Expose `Socket`.
 */

module.exports = Socket;

/**
 * Initialize a new `Socket`.
 *
 * A super socket "Socket" encapsulates the
 * reconnection logic with exponential backoff,
 * serving as a base for the `Queue`.
 *
 * @api private
 */

function Socket() {
  var self = this;
  var sock = this.sock = new net.Socket;

  this.retryTimeout = this.retry = 100;
  this.retryMaxTimeout = 2000;
  
  sock.on('error', function(err){
    if ('ECONNREFUSED' != err.code) {
      self.emit('error', err);
    }
  });

  sock.on('data', function(chunk){
    self.emit('data', chunk);
  });

  sock.on('close', function(){
    self.connected = false;
    if (self.closing) return self.emit('close');
    setTimeout(function(){
      self.emit('reconnect attempt');
      sock.destroy();
      self.connect(self.port);
      self.retry = Math.min(self.retryMaxTimeout, self.retry * 1.5);
    }, self.retry);
  });

  sock.on('connect', function(){
    self.connected = true;
    self.retry = self.retryTimeout;
    self.emit('connect'); // TODO: dont emit each time... will invoke callback too many times
    self.callback && self.callback();
  });
}

/**
 * Inherit from `Emitter.prototype`.
 */

Socket.prototype.__proto__ = Emitter.prototype;

/**
 * Connect to `port` and invoke `fn()`.
 *
 * TODO: host
 *
 * @param {Number} port
 * @param {Function} fn
 * @api public
 */

Socket.prototype.connect = function(port, fn){
  this.port = port;
  this.sock.connect(port, '127.0.0.1');
  this.callback = fn;
  return this;
};

/**
 * Close the socket.
 *
 * @api public
 */

Socket.prototype.close = function(){
  this.closing = true;
  this.sock.destroy();
  return this;
};
