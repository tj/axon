
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
 * The "Parser" encapsulates message framing and
 * applying of codecs for each message received.
 *
 * @api private
 */

function Parser(){
  this.buf = new Buffer(4);
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

Parser.prototype.onmessage = function(msg){};

/**
 * Frame the given `chunk`.
 *
 * @param {Buffer} chunk
 * @api private
 */

Parser.prototype.write = function(chunk){
  if ('header' == this.state) this.frameHeader(chunk)
  else this.frameBody(chunk);
};

/**
 * Frame headers.
 *
 * @param {Buffer} chunk
 * @api private
 */

Parser.prototype.frameHeader = function(chunk) {
  var remaining = 4 - this.i;

  var n = remaining > chunk.length
    ? chunk.length
    : remaining;

  // bufer
  for (var i = 0; i < n; i++) {
    this.buf[this.i++] = chunk[i];
  }

  // complete
  if (4 === this.i) {
    this.state = 'body';
    this.i = 0;
    this.headers = this.parseHeaders(this.buf);
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

Parser.prototype.frameBody = function(chunk) {
  var remaining = this.headers.length - this.i;

  var n = remaining > chunk.length
    ? chunk.length
    : remaining;

  var multipart = this.headers.meta === 0x00;

  // bufer
  chunk.copy(this.body, this.i, 0, n);
  this.i += n;

  // complete
  if (this.headers.length === this.i) {
    this.onmessage(this.parseBody(this.body, this.headers), multipart);
    this.reset();
  }

  // bytes remaining
  if (chunk.length - n) this.write(chunk.slice(n));
};

/**
 * Parsers out `meta` and `length` header octets.
 *
 * @param {Buffer} buf
 * @return {Object}
 * @api private
 */

Parser.prototype.parseHeaders = function(buf) {
  var meta = buf[0]
    , len = 0;

  // zero out MSB
  buf[0] = 0x0;
  len = buf.readUInt32BE(0);

  // undo side-effect
  buf[0] = meta;

  return {
    length: len,
    meta: meta
  };
};

/**
 * Parses out multipart messages.
 *
 * @param {Buffer} buf
 * @return {Boolean} multipart
 * @api private
 */

Parser.prototype.parseBody = function(body, headers) {
  var multipart = headers.meta === 0x00;
  var msgs = []
    , buf
    , header;

  if (!multipart) return this.decode(body, headers.meta);

  for (var i = 0; i < body.length;) {
    header = this.parseHeaders(body.slice(i, i + 4));
    buf = body.slice(i + 4, i + header.length + 4);
    msgs.push(this.decode(buf, header.meta));
    i += header.length + 4;
  }

  return msgs;
};

/**
 * Apply the codec `type` to `msg`.
 *
 * @param {Buffer} msg
 * @param {String} type
 * @return {Mixed} decoded message
 * @api private
 */

Parser.prototype.decode = function(msg, type) {
  var codec = codecs.byId(type);
  return codec.decode(msg);
};

/**
 * Set/resets to the default state.
 */

Parser.prototype.reset = function() {
  this.state = 'header';
  this.i = 0;
  this.headers = null;
  this.body = null;
};

