
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , Parser = require('../parser')
  , debug = require('debug')('ss:queue')
  , net = require('net');

/**
 * Expose `Queue`.
 */

exports = module.exports = Queue;

/**
 * Initialize a new `Queue`.
 *
 * The "Queue" encapsulates message packing & framing,
 * and applying of codecs for each message received.
 *
 * @api private
 */

function Queue() {
  Socket.call(this);
  var self = this;
  var sock = this.sock;
  this.socks = [];
  this.buf = [];
  this.parser = new Parser;
  this.format('none');
  sock.setNoDelay();
  sock.on('data', this.frame.bind(this));
  sock.on('connect', this.flush.bind(this));
  this.parser.onmessage = this.onmessage(sock);
}

/**
 * Inherit from `Socket.prototype`.
 */

Queue.prototype.__proto__ = Socket.prototype;

/**
 * Set format to `type`.
 *
 * @param {String} type
 * @return {Queue}
 * @api public
 */

Queue.prototype.format = function(type){
  debug('format %s', type);
  this.parser.format(type);
  return this;
};

/**
 * Frame the given `chunk`.
 *
 * @param {Buffer} chunk
 * @api private
 */

Queue.prototype.frame = function(chunk){
  this.parser.write(chunk);
};

/**
 * Handle message event.
 *
 * @param {Socket} sock
 * @return {Function}
 * @api private
 */

Queue.prototype.onmessage = function(sock){
  var self = this;
  return function(msg){
    self.emit('message', msg, function(replyMsg){
      var codec = self.parser.codec;
      sock.write(self.parser.pack(codec.encode(replyMsg), codec.id));
    });
  };
};

/**
 * Flush queued messages.
 *
 * @api private
 */

Queue.prototype.flush = function(){
  var buf = this.buf;
  var len = buf.length;
  this.buf = [];
  debug('flush');
  for (var i = 0; i < len; ++i) {
    this.send(buf[i]);
  }
};

/**
 * Close the server.
 *
 * @api public
 */

Queue.prototype.close = function(){
  debug('close');
  this.server && this.server.close();
  return Socket.prototype.close.call(this);
};

/**
 * Remove `sock`.
 *
 * @param {Socket} sock
 * @api private
 */

Queue.prototype.removeSocket = function(sock){
  var i = this.socks.indexOf(sock);
  this.socks.splice(i, 1);
};

/**
 * Add `sock`.
 *
 * @param {Socket} sock
 * @api private
 */

Queue.prototype.addSocket = function(sock){
  var self = this;
  var parser = new Parser;
  this.socks.push(sock);
  sock.on('data', parser.write.bind(parser));
  parser.onmessage = this.onmessage(sock);
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
 * @param {Number} port
 * @param {Function} fn
 * @api public
 */

Queue.prototype.bind = function(port, host, fn){
  if ('function' == typeof host) fn = host, host = undefined;

  var self = this;
  this.type = 'server';
  host = host || '0.0.0.0';

  debug('bind %s:%s', host, port);

  this.server = net.createServer(function(sock){
    debug('connect %s', sock.remoteAddress);
    self.addSocket(sock);
    self.emit('connection', sock);
    sock.on('close', function(){
      debug('disconnect %s', sock.remoteAddress);
      self.removeSocket(sock);
    });
  });

  this.server.on('listening', function(){
    self.emit('bind');
  });

  this.server.listen(port, host, fn);
};
