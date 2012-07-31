
/**
 * Expose `Encoder`.
 */

exports = module.exports = Encoder;

/**
 * Initialize a new `Encoder`.
 *
 * The "Encoder" encapsulates packing messages and
 * maintaining state between multiple writes in the
 * case of multipart messages.
 *
 * @api private
 */

function Encoder(){
  this.parts = null;
}

/**
 * Pack `msg` as `format`.
 *
 * TODO: zero-copy
 *
 * @param {String|Buffer} msg
 * @param {Number} format
 * @return {Buffer}
 * @api private
 */

Encoder.prototype.pack = function(msg, format) {
  if ('string' == typeof msg) msg = new Buffer(msg);

  var buf = new Buffer(msg.length + 4);

  // length
  buf.writeUInt32BE(msg.length, 0);

  // format
  buf[0] = format;

  // data
  msg.copy(buf, 4);

  // multipart chaining
  if (this.parts) {
    this.parts.push(buf);
    return this;
  }

  return buf;
};

/**
 * Indicate that `pack()` should bufer up messages
 * and allow chaining. "Multi mode" if you will.
 *
 * @return {Encoder}
 * @api private
 */

Encoder.prototype.multi = function() {
  this.parts = [];
  return this;
};

/**
 * Creates a "message of messages" with all prior `pack()`
 * commands invoked during "multi" mode.
 *
 * TODO: multi toggling is kinda hacky...
 *
 * @return {Buffer}
 * @api private
 */

Encoder.prototype.end = function() {
  var parts = this.parts.splice(0);

  // if only one msg was packed, dont use multipart
  if (parts.length === 1) return parts[0];

  // turn off multipart for final "pack"
  this.parts = null;

  // outter message
  var buf = this.pack(Buffer.concat(parts), 0);

  // turn multipart back on.
  this.parts = [];

  return buf;
};