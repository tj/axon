
/**
 * Module dependencies.
 */

var codecs = require('./codecs');

/**
 * Expose `Message`.
 */

exports = module.exports = Message;

/**
 * Initialize a new `Message`.
 *
 * The "Message" encapsulates packing messages and
 * maintaining state between multiple writes in the
 * case of multipart messages.
 *
 * @api private
 */

function Message(data, meta){
  this.parts = [];
  this.byteLength = 0;
  if (data) this.write(data, meta);
}

/**
 * Appends a new message to the buffer.
 *
 * @param {String|Buffer} data
 * @param {Mixed} meta
 * @return {Message}
 * @api private
 */

Message.prototype.write = function(data, meta){
  var buf = this.pack(data, meta == null ? 1 : meta);
  this.byteLength += buf.length;
  this.parts.push(buf);
  return this;
};

/**
 * Returns buffer of the single message or a new
 * buffer containtain all written messages (multipart).
 *
 * @return {Buffer}
 * @api private
 */

Message.prototype.toBuffer = function(){
  if (this.parts.length === 1) return this.parts[0];

  var buf = new Buffer(this.byteLength);
  var off = 0;
  var msg;

  for (var i = 0; i < this.parts.length; i++) {
    msg = this.parts[i];
    msg.copy(buf, off, 0, msg.length);
    off += msg.length;
  }

  return this.pack(buf, 0);
};

/**
 * Pack `msg`.
 *
 * TODO: zero-copy
 *
 * @param {String|Buffer} msg
 * @param {Number} meta
 * @return {Buffer}
 * @api private
 */

Message.prototype.pack = function(msg, meta){
  if ('string' == typeof msg) msg = new Buffer(msg);
  var buf = new Buffer(msg.length + 4);

  // length
  buf.writeUInt32BE(msg.length, 0);

  // meta
  buf[0] = meta;

  // data
  msg.copy(buf, 4);

  return buf;
};