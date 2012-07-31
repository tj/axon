
/**
 * Module dependencies.
 */

var codecs = require('./codecs');

/**
 * Expose `Decoder`.
 */

exports = module.exports = Decoder;

/**
 * Initialize a new `Decoder`.
 *
 * The "Decoder" encapsulates message framing and
 * applying of codecs for each message received.
 *
 * @api private
 */

function Decoder(){
  this.buff = new Buffer(4);
  this.i = 0;
  this.state = 'header';
  this.headers = null;
  this.body = null;
}

/**
 * Temporary stub. Calling context should impement this
 * in order to receive the parsed message(s).
 *
 * @param {Mixed} message
 * @api private
 */

Decoder.prototype.onmessage = function(msg){};

/**
 * Frame the given `chunk`.
 *
 * @param {Buffer} chunk
 * @api private
 */

Decoder.prototype.write = function(chunk){
  switch (this.state) {
    case 'header': this.frameHeader(chunk); break;
    case 'body': this.frameBody(chunk); break;
    default: throw new Error('invalid state "' + this.state + '"');
  }
};

/**
 * Frame headers.
 *
 * @param {Buffer} chunk
 * @api private
 */

Decoder.prototype.frameHeader = function(chunk) {
  var remaining = 4 - this.i;

  var n = remaining > chunk.length
    ? chunk.length
    : remaining;

  // buffer
  for (var i = 0; i < n; i++) {
    this.buff[this.i++] = chunk[i];
  }

  // complete
  if (4 === this.i) {
    this.state = 'body';
    this.i = 0;
    this.headers = this.parseHeaders(this.buff);
    this.body = new Buffer(this.headers.length);
  }

  // remaining chunks
  if (chunk.length - n) this.write(chunk.slice(n));
};

/**
 * Frame body.
 *
 * @param {Buffer} chunk
 * @api private
 */

Decoder.prototype.frameBody = function(chunk) {
  var remaining = this.headers.length - this.i;

  var n = remaining > chunk.length
    ? chunk.length
    : remaining;

  // buffer
  chunk.copy(this.body, this.i, 0, n);
  this.i += n;

  // complete
  if (this.headers.length === this.i) {
    this._onmessage(this.body, this.headers);
    this.reset();
  }

  // bytes remaining
  if (chunk.length - n) this.write(chunk.slice(n));
};

/**
 * Parsers out `meta` and `length` header octets.
 *
 * @param {Buffer} buff
 * @return {Object}
 * @api private
 */

Decoder.prototype.parseHeaders = function(buff) {
  var meta = buff[0]
    , len = 0;

  // zero out MSB
  buff[0] = 0x0;
  len = buff.readUInt32BE(0);

  // undo side-effect
  buff[0] = meta;

  return {
    length: len,
    meta: meta
  };
};

/**
 * Parses out multipart messages.
 *
 * @param {Buffer} buff
 * @param {Object} header
 * @return {Array}
 * @api private
 */

Decoder.prototype.parseMultipart = function(buff) {
  var msgs = []
    , body
    , header;

  for (var i = 0; i < buff.length;) {
    header = this.parseHeaders(buff.slice(i, i + 4));
    body = buff.slice(i + 4, i + header.length + 4);
    msgs.push(this.decode(body, header.meta));
    i += header.length + 4;
  }

  return msgs;
};

/**
 * Handle message decoding and invoke `onmessage(msg)`.
 *
 * @param {Buffer} msg
 * @param {Object} header
 * @api public
 */

Decoder.prototype._onmessage = function(msg, header){
  if (header.meta === 0x0) {
    this.onmessage(this.parseMultipart(msg), true);
  } else {
    this.onmessage(this.decode(msg, header.meta), false);
  }
};

/**
 * Apply the codec `type` to `msg`.
 *
 * @param {Buffer} msg
 * @param {String} fmt
 * @return {Mixed} decoded message
 * @api private
 */

Decoder.prototype.decode = function(msg, type) {
  var codec = codecs.byId(type);
  return codec.decode(msg);
};

/**
 * Set/resets to the default state.
 */

Decoder.prototype.reset = function() {
  this.state = 'header';
  this.i = 0;
  this.buff.fill(0x0);
  this.headers = null;
  this.body = null;
};


