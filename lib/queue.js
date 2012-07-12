
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , codecs = require('./codecs')
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
  var i = 0
    , len = chunk.length;

  while (i < len) {
    switch (this.state) {
      case 'meta':
        this.meta = this.unpack(chunk, i);
        this.msg = new Buffer(this.meta.length);
        this.state = 'message';
        this.offset = 0;
        i += 4;
        break;
      case 'message':
        var needed = this.meta.length
          , left = len - i
          , n = needed > left
            ? left
            : needed;

        chunk.copy(this.msg, this.offset, i, i + n);
        this.offset += n;
        i += n;
        if (this.offset == needed) {
          this.onmessage(this.msg, this.meta);
          this.state = 'meta';
        }
        break;
    }
  }
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
 * @param {String} format
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
 * Unpack `msg` at `offset`.
 *
 * @param {String|Buffer} msg
 * @param {Number} offset
 * @return {Object}
 * @api private
 */

Queue.prototype.unpack = function(buf, offset){
  // format
  var format = buf[offset];

  // length
  buf[offset] = 0;
  var len = buf.readUInt32BE(offset);

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
  var buf = this.buf
    , len = buf.length;
  this.buf = [];
  for (var i = 0; i < len; ++i) {
    this.send(buf[i]);
  }
};

// TODO: refactor this stuff...

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
