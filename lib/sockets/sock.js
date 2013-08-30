
/**
 * Module dependencies.
 */

var net = require('net')
  , Parser = require('../parser')
  , Message = require('../message')
  , codecs = require('../codecs')
  , Emitter = require('events').EventEmitter
  , debug = require('debug')('axon:sock')
  , Configurable = require('configurable')
  , url = require('url');

/**
 * Errors to ignore.
 */

var ignore = [
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ENETDOWN',
  'EPIPE'
];

/**
 * Expose `Socket`.
 */

module.exports = Socket;

/**
 * Initialize a new `Socket`.
 *
 * A "Socket" encapsulates the ability of being
 * the "client" or the "server" depending on
 * whether `connect()` or `bind()` was called.
 *
 * Upon sending and recieving messages, the correct codec
 * set by `format` will be applied. Both sides must elect
 * the same codec, or all hell will break loose on the app.
 *
 * @api private
 */

function Socket() {
  var self = this;
  this.opts = {};
  this.server = null;
  this.socks = [];
  this.settings = {};
  this.format('none');
  this.set('hwm', Infinity);
  this.set('identity', String(process.pid));
  this.set('retry timeout', 100);
  this.set('retry max timeout', 5000);
}

/**
 * Inherit from `Emitter.prototype`.
 */

Socket.prototype.__proto__ = Emitter.prototype;

/**
 * Make it configurable `.set()` etc.
 */

Configurable(Socket.prototype);

/**
 * Use the given `plugin`.
 *
 * @param {Function} plugin
 * @api private
 */

Socket.prototype.use = function(plugin){
  plugin(this);
  return this;
};

/**
 * Set format to `type`.
 *
 * @param {String} type
 * @return {Socket}
 * @api public
 */

Socket.prototype.format = function(type){
  var codec = codecs.byName(type);
  if (!codec) throw new Error('unknown format "' + type + '"');
  this.codec = codec;
  return this;
};


/**
 * Creates a new `Message` and writes `data` using the
 * `codec` set already by `format`.
 *
 * This will only work for single part messages or multi
 * part message that all use the same codec. If you need
 * otherwise, use the `Message` constructor to craft
 * your own message.
 *
 * @param {Mixed} data
 * @return {Buffer}
 * @api private
 */

Socket.prototype.pack = function(data){
  var msg = new Message
    , codec = this.codec;

  if (Array.isArray(data)) {
    for (var i = 0; i < data.length; i++) {
      msg.write(codec.encode(data[i]), codec.id);
    }
  } else {
    msg.write(codec.encode(data), codec.id);
  }

  return msg.toBuffer();
};

/**
 * Close all open underlying sockets.
 *
 * @api private
 */

Socket.prototype.closeSockets = function(){
  debug('closing %d connections', this.socks.length);
  this.socks.forEach(function(sock){
    sock.destroy();
  });
};

/**
 * Close the socket.
 *
 * Delegates to the server or clients
 * based on the socket `type`.
 *
 * @param {Function} [fn]
 * @api public
 */

Socket.prototype.close = function(fn){
  debug('closing');
  this.closing = true;
  this.closeSockets();
  if (this.server) this.closeServer(fn);
};

/**
 * Close the server.
 *
 * @param {Function} [fn]
 * @api public
 */

Socket.prototype.closeServer = function(fn){
  debug('closing server');
  this.server.on('close', this.emit.bind(this, 'close'));
  this.server.close();
  fn && fn();
};

/**
 * Return the server address.
 *
 * @return {Object}
 * @api public
 */

Socket.prototype.address = function(){
  if (!this.server) return;
  var addr = this.server.address();
  addr.string = 'tcp://' + addr.address + ':' + addr.port;
  return addr;
};

/**
 * Remove `sock`.
 *
 * @param {Socket} sock
 * @api private
 */

Socket.prototype.removeSocket = function(sock){
  var i = this.socks.indexOf(sock);
  if (!~i) return;
  debug('remove socket %d', i);
  this.socks.splice(i, 1);
};

/**
 * Add `sock`.
 *
 * @param {Socket} sock
 * @api private
 */

Socket.prototype.addSocket = function(sock){
  var parser = new Parser;
  var i = this.socks.push(sock) - 1;
  debug('add socket %d', i);
  sock.on('data', parser.write.bind(parser));
  parser.onmessage = this.onmessage(sock);
};

/**
 * Handle `sock` errors.
 *
 * Emits:
 *
 *  - `error` (err) when the error is not ignored
 *  - `ignored error` (err) when the error is ignored
 *  - `socket error` (err) regardless of ignoring
 *
 * @param {Socket} sock
 * @api private
 */

Socket.prototype.handleErrors = function(sock){
  var self = this;
  sock.on('error', function(err){
    debug('error %s', err.code || err.message);
    self.emit('socket error', err);
    self.removeSocket(sock);
    if (!~ignore.indexOf(err.code)) return self.emit('error', err);
    debug('ignored %s', err.code);
    self.emit('ignored error', err);
  });
};

/**
 * Handles framed messages emitted from the parser, by
 * default it will go ahead and emit the "message" events on
 * the socket. However, if the "higher level" socket needs
 * to hook into the messages before they are emitted, it
 * should override this method and take care of everything
 * it self, including emitted the "message" event.
 *
 * @param {net.Socket} sock
 * @return {Function} closure(msg, mulitpart)
 * @api private
 */

Socket.prototype.onmessage = function(sock){
  var self = this;
  return function(msg, multipart){
    if (multipart) {
      msg.unshift('message');
      self.emit.apply(self, msg);
    } else {
      self.emit('message', msg);
    }
  };
};

/**
 * Connect to `port` at `host` and invoke `fn()`.
 *
 * Defaults `host` to localhost.
 *
 * @param {Number|String} port
 * @param {String} host
 * @param {Function} fn
 * @return {Socket}
 * @api public
 */

Socket.prototype.connect = function(port, host, fn){
  var self = this;
  if ('server' == this.type) throw new Error('cannot connect() after bind()');
  if ('function' == typeof host) fn = host, host = undefined;

  if ('string' == typeof port) {
    port = url.parse(port);
    host = port.hostname;
    port = parseInt(port.port, 10);
  }

  var max = self.get('retry max timeout');
  var sock = new net.Socket;
  sock.setNoDelay();
  this.type = 'client';
  port = port;
  host = host || '0.0.0.0';

  this.handleErrors(sock);

  sock.on('close', function(){
    self.connected = false;
    self.removeSocket(sock);
    if (self.closing) return self.emit('close');
    var retry = self.retry || self.get('retry timeout');
    setTimeout(function(){
      debug('attempting reconnect');
      self.emit('reconnect attempt');
      sock.destroy();
      self.connect(port, host);
      self.retry = Math.min(max, retry * 1.5);
    }, retry);
  });

  sock.on('connect', function(){
    debug('connect');
    self.connected = true;
    self.addSocket(sock);
    self.retry = self.get('retry timeout');
    self.emit('connect');
    fn && fn();
  });

  debug('connect attempt %s:%s', host, port);
  sock.connect(port, host);
  return this;
};

/**
 * Handle connection.
 *
 * @param {Socket} sock
 * @api private
 */

Socket.prototype.onconnect = function(sock){
  var self = this;
  var addr = sock.remoteAddress + ':' + sock.remotePort;
  debug('accept %s', addr);
  this.addSocket(sock);
  this.handleErrors(sock);
  this.emit('connect', sock);
  sock.on('close', function(){
    debug('disconnect %s', addr);
    self.emit('disconnect', sock);
    self.removeSocket(sock);
  });
};

/**
 * Bind to `port` at `host` and invoke `fn()`.
 *
 * Defaults `host` to INADDR_ANY.
 *
 * Emits:
 *
 *  - `connection` when a client connects
 *  - `disconnect` when a client disconnects
 *  - `bind` when bound and listening
 *
 * @param {Number|String} port
 * @param {Function} fn
 * @return {Socket}
 * @api public
 */

Socket.prototype.bind = function(port, host, fn){
  var self = this;
  if ('client' == this.type) throw new Error('cannot bind() after connect()');
  if ('function' == typeof host) fn = host, host = undefined;

  if ('string' == typeof port) {
    port = url.parse(port);
    host = port.hostname;
    port = parseInt(port.port, 10);
  }

  this.type = 'server';
  host = host || '0.0.0.0';

  this.server = net.createServer(this.onconnect.bind(this));

  debug('bind %s:%s', host, port);
  this.server.on('listening', this.emit.bind(this, 'bind'));
  this.server.listen(port, host, fn);
  return this;
};
