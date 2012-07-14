
/**
 * Module dependencies.
 */

var codecs = require('./codecs');

/**
 * Expose `Parser`.
 */

exports = module.exports = Parser;

/**
 * Initialize a new `Parser`.
 *
 * The "Parser" encapsulates message packing & framing,
 * and applying of codecs for each message received.
 *
 * @api private
 */

function Parser() {
  this.i = 0;
  this._buf = new Buffer(4);
  this.state = 'meta';
  this.format('none');
}

/**
 * Set format to `type`.
 *
 * @param {String} type
 * @return {Parser}
 * @api public
 */

Parser.prototype.format = function(type){
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

Parser.prototype.write = function(chunk){
  if ('meta' == this.state) this.frameMeta(chunk)
  else this.framePayload(chunk);
};

/**
 * Frame meta.
 *
 * @param {Buffer} chunk
 * @api private
 */

Parser.prototype.frameMeta = function(chunk){
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
  if (chunk.length - n) this.write(chunk.slice(n));
};

/**
 * Frame payload.
 *
 * @param {Buffer} chunk
 * @api private
 */

Parser.prototype.framePayload = function(chunk){
  var remaining = this.meta.length - this.i;

  var n = remaining > chunk.length
    ? chunk.length
    : remaining;

  // buffer
  chunk.copy(this.payload, this.i, 0, n);
  this.i += n;

  // complete
  if (this.i == this.meta.length) {
    this._onmessage(this.payload, this.meta);
    this.state = 'meta';
    this.i = 0;
  }

  // bytes remaining
  if (chunk.length - n) this.write(chunk.slice(n));
};

/**
 * Decode `msg` as `fmt`.
 *
 * @param {Buffer} msg
 * @param {String} fmt
 * @return {Mixed} decoded message
 * @api private
 */

Parser.prototype.decode = function(msg, fmt){
  var codec = codecs.byId(fmt);
  return codec.decode(msg);
};

/**
 * Handle message decoding and invoke `onmessage(msg)`.
 *
 * @param {Buffer} msg
 * @param {Object} meta
 * @api public
 */

Parser.prototype._onmessage = function(msg, meta){
  this.onmessage(this.decode(msg, meta.format));
};

/**
 * Pack `msg` as `format`.
 *
 * @param {String|Buffer} msg
 * @param {Number} format
 * @return {Buffer}
 * @api private
 */

Parser.prototype.pack = function(msg, format){
  // TODO: zero-copy
  if ('string' == typeof msg) msg = new Buffer(msg);
  var buf = new Buffer(msg.length + 4);

  // length
  buf.writeUInt32BE(msg.length, 0);

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

Parser.prototype.unpack = function(buf){
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