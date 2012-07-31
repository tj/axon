
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , Decoder = require('../decoder')
  , Encoder = require('../encoder')
  , codecs = require('../codecs')
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
  this.decoder = new Decoder;
  this.encoder = new Encoder;
  this.format('none');
  sock.setNoDelay();
  sock.on('data', this.frame.bind(this));
  sock.on('connect', this.flush.bind(this));
  this.decoder.onmessage = function(msg){
    self.emit('message', msg);
  };
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
  var codec = codecs.byName(type);
  if (!codec) throw new Error('unknown format "' + type + '"');
  this.codec = codec;
  return this;
};

/**
 * Frame the given `chunk`.
 *
 * @param {Buffer} chunk
 * @api private
 */

Queue.prototype.frame = function(chunk){
  this.decoder.write(chunk);
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
  debug('flush -- %d messages', len);
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
  var decoder = new Decoder;
  this.socks.push(sock);
  sock.on('data', decoder.write.bind(decoder));
  decoder.onmessage = function(msg){
    self.emit('message', msg);
  };
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
