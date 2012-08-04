
/**
 * Module dependencies.
 */

var net = require('net')
  , Parser = require('../parser')
  , Message = require('../message')
  , codecs = require('../codecs')
  , Emitter = require('events').EventEmitter
  , debug = require('debug')('axon:sock')
  , url = require('url');

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
  this.format('none');
  this.option('retry timeout', 100);
  this.option('retry max timeout', 2000);
}

/**
 * Inherit from `Emitter.prototype`.
 */

Socket.prototype.__proto__ = Emitter.prototype;

/**
 * Set or get the option `key`.
 *
 * @param {String} key
 * @param {Mixed} value
 * @api public
 */

Socket.prototype.option = function(key, value){
  if (arguments.length == 1) {
    return this.opts[key];
  } else {
    this.opts[key] = value;
    return this;
  }
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
  var msg = new Message();
  var codec = this.codec;

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
 * Close the socket.
 *
 * Delegates to the server or clients
 * based on the socket `type`.
 *
 * @api public
 */

Socket.prototype.close = function(){
  debug('close');
  this.closing = true;
  if ('server' == this.type) {
    this.server && this.server.close();
  } else {
    this.socks.forEach(function(sock){
      sock.destroy();
    });
  }
};

/**
 * Remove `sock`.
 *
 * @param {Socket} sock
 * @api private
 */

Socket.prototype.removeSocket = function(sock){
  var i = this.socks.indexOf(sock);
  this.socks.splice(i, 1);
};

/**
 * Add `sock`.
 *
 * TODO: Better ways to hook into the parsed
 * messages prior to the application receiving
 * them?
 *
 * @param {Socket} sock
 * @api private
 */

Socket.prototype.addSocket = function(sock){
  var self = this;
  var parser = new Parser;
  this.socks.push(sock);
  sock.on('data', parser.write.bind(parser));
  parser.onmessage = function(msg, multipart){
    if (multipart) {
      self.emit.apply(self, ['message'].concat(msg));
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

  var sock = new net.Socket;
  sock.setNoDelay();
  this.type = 'client';
  port = port;
  host = host || '127.0.0.1';

  sock.on('error', function(err){
    if ('ECONNREFUSED' != err.code) {
      self.emit('error', err);
    }
  });

  sock.on('close', function(){
    self.connected = false;
    self.removeSocket(sock);
    if (self.closing) return self.emit('close');
    var max = self.option('max retry timeout');
    var retry = self.retry || self.option('retry timeout');
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
    self.retry = self.option('retry timeout');
    self.emit('connect');
    fn && fn();
  });

  debug('connect attempt %s:%s', host, port);
  sock.connect(port, host);
  return this;
};

/**
 * Bind to `port` at `host` and invoke `fn()`.
 *
 * Defaults `host` to INADDR_ANY.
 *
 * Emits:
 *
 *  - `connection` when a connection is accepted
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

  this.server = net.createServer(function(sock){
    debug('connection %s', sock.remoteAddress);
    self.addSocket(sock);
    self.emit('connect', sock);
    sock.on('close', function(){
      debug('disconnect %s', sock.remoteAddress);
      self.removeSocket(sock);
    });
  });

  debug('bind %s:%s', host, port);
  this.server.on('listening', this.emit.bind('bind'));
  this.server.listen(port, host, fn);
  return this;
};
