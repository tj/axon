
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , codecs = require('../codecs')
  , net = require('net');

/**
 * Expose `Queue`.
 */

exports = module.exports = Queue;

/**
 * Format map.
 */

var format = { ids: {}, names: {} };

/**
 * Build the map.
 */

Object.keys(codecs).forEach(function(name, i){
  format.ids[name] = i;
  format.names[i] = name;
});

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
  this._buf = new Buffer(4);
  this.i = 0;
  this.state = 'meta';
  this.format('none');
  sock.setNoDelay();
  sock.on('data', this.frame.bind(this));
  sock.on('connect', this.flush.bind(this));
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
  var id = format.ids[type];
  if (null == id) throw new Error('unknown format "' + type + '"');
  this._format = id;
  return this;
};

/**
 * Frame the given `chunk`.
 *
 * @param {Buffer} chunk
 * @api private
 */

Queue.prototype.frame = function(chunk){
  if ('meta' == this.state) this.frameMeta(chunk)
  else this.framePayload(chunk);
};

/**
 * Frame meta.
 *
 * @param {Buffer} chunk
 * @api private
 */

Queue.prototype.frameMeta = function(chunk){
  var remaining = 4 - this.i;

  var n = remaining > chunk.length
    ? chunk.length
    : remaining;

  // buffer
  for (var i = 0; i < n; ++i) {
    this._buf[this.i++] = chunk[i];
  }

  // complete
  if (4 == this.i) {
    this.meta = this.unpack(this._buf);
    this.payload = new Buffer(this.meta.length);
    this.state = 'payload';
    this.i = 0;
  }

  // bytes remaining
  if (chunk.length - n) this.frame(chunk.slice(n));
};

/**
 * Frame payload.
 *
 * @param {Buffer} chunk
 * @api private
 */

Queue.prototype.framePayload = function(chunk){
  var remaining = this.meta.length - this.i;

  var n = remaining > chunk.length
    ? chunk.length
    : remaining;

  // buffer
  chunk.copy(this.payload, this.i, 0, n);
  this.i += n;

  // complete
  if (this.i == this.meta.length) {
    this.onmessage(this.payload, this.meta);
    this.state = 'meta';
    this.i = 0;
  }

  // bytes remaining
  if (chunk.length - n) this.frame(chunk.slice(n));
};

/**
 * Decode `msg` as `fmt`.
 *
 * @param {Buffer} msg
 * @param {String} fmt
 * @return {Mixed} decoded message
 * @api private
 */

Queue.prototype.decode = function(msg, fmt){
  var decode = codecs[format.names[fmt]].decode;
  return decode(msg);
};

/**
 * Encode `msg` as `fmt`.
 *
 * @param {Buffer} msg
 * @param {String} fmt
 * @return {Mixed} encoded message
 * @api private
 */

Queue.prototype.encode = function(msg, fmt){
  var encode = codecs[format.names[fmt]].encode;
  return encode(msg);
};

/**
 * Handle message decoding and emit "message".
 *
 * @param {Buffer} msg
 * @param {Object} meta
 * @api public
 */

Queue.prototype.onmessage = function(msg, meta){
  this.emit('message', this.decode(msg, meta.format));
};

/**
 * Pack `msg` as `format`.
 *
 * @param {String|Buffer} msg
 * @param {Number} format
 * @return {Buffer}
 * @api private
 */

Queue.prototype.pack = function(msg, format){
  // TODO: zero-copy
  if ('string' == typeof msg) msg = new Buffer(msg);
  var len = msg.length
    , buf = new Buffer(len + 4);

  // length
  buf.writeUInt32BE(len, 0);

  // format
  buf[0] = format;

  // data
  msg.copy(buf, 4);
  return buf;
};

/**
 * Unpack `msg`.
 *
 * @param {String|Buffer} msg
 * @return {Object}
 * @api private
 */

Queue.prototype.unpack = function(buf){
  // format
  var format = buf[0];

  // zero the MSB
  buf[0] = 0;

  // length
  var len = buf.readUInt32BE(0);

  return {
    length: len,
    format: format
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
  this.server && this.server.close();
  return Socket.prototype.close.call(this);
};

/**
 * Bind to `port` and invoke `fn()`.
 *
 * Emits:
 *
 *  - `connect` when a connection is accepted
 *  - `bind` when bound and listening
 *
 * TODO: host
 *
 * @param {Number} port
 * @param {Function} fn
 * @api public
 */

Queue.prototype.bind = function(port, fn){
  var self = this;

  this.server = net.createServer(function(sock){
    self.socks.push(sock);

    self.emit('connect', sock);

    sock.on('close', function(){
      self.socks.forEach(function(s, i){
        if (s == sock) self.socks.splice(i, 1);
      })
    });

    sock.on('data', function(chunk){
      for (var i = o = 0, len = chunk.length; i < len; ++i) {
        if (0 == chunk[i]) {
          // TODO: this could be half a message...
          // TODO: dont append nul... use lengths
          // TODO: add Buffer support
          self.onmessage(chunk.slice(o, i));
          o = i + 1;
        }
      }
    });
  });

  this.server.on('listening', function(){
    self.emit('bind');
  });

  this.server.listen(port, fn);
};
