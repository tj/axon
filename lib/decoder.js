
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

  var multipart = this.headers.meta === 0x00;

  // buffer
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
 * @return {Boolean} multipart
 * @api private
 */

Decoder.prototype.parseBody = function(body, headers) {
  var multipart = headers.meta === 0x00;
  var msgs = []
    , buff
    , header;

  if (!multipart) return this.decode(body, headers.meta);

  for (var i = 0; i < body.length;) {
    header = this.parseHeaders(body.slice(i, i + 4));
    buff = body.slice(i + 4, i + header.length + 4);
    msgs.push(this.decode(buff, header.meta));
    i += header.length + 4;
  }

  return msgs;
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


