
/**
 * Module dependencies.
 */

var net = require('net')
  , Emitter = require('events').EventEmitter
  , debug = require('debug')('ss:sock');

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
      debug('attempting reconnect');
      self.emit('reconnect attempt');
      sock.destroy();
      self.connect(self.port, self.host);
      self.retry = Math.min(self.retryMaxTimeout, self.retry * 1.5);
    }, self.retry);
  });

  sock.on('connect', function(){
    debug('connect');
    self.connected = true;
    self.retry = self.retryTimeout;
    self.emit('connect');
    self.callback && self.callback();
  });
}

/**
 * Inherit from `Emitter.prototype`.
 */

Socket.prototype.__proto__ = Emitter.prototype;

/**
 * Connect to `port` at `host` and invoke `fn()`.
 *
 * Defaults `host` to localhost.
 *
 * @param {Number} port
 * @param {String} host
 * @param {Function} fn
 * @api public
 */

Socket.prototype.connect = function(port, host, fn){
  if ('function' == host) fn = host, host = undefined;
  this.type = 'client';
  this.port = port;
  this.host = host || '127.0.0.1';
  debug('connect %s:%s', this.host, this.port);
  this.sock.connect(this.port, this.host);
  this.callback = fn;
  return this;
};

/**
 * Close the socket.
 *
 * @api public
 */

Socket.prototype.close = function(){
  debug('close');
  this.closing = true;
  this.sock.destroy();
  return this;
};
