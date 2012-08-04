
/**
 * Expose `Batch`.
 */

module.exports = Batch;

/**
 * Initialize a new `Batch`.
 *
 * The "Batch" is in charge of buffering
 * messages which may then be written to
 * the socket(s) at once, increasing throughput.
 *
 * @api private
 */

function Batch() {
  this.clear();
}

/**
 * Add `msg` to the batch.
 *
 * @param {Buffer} msg
 * @api private
 */

Batch.prototype.add = function(msg){
  this.msgs.push(msg);
};

/**
 * Check if the batch is empty.
 *
 * @return {Boolean}
 * @api private
 */

Batch.prototype.empty = function(){
  return 0 == this.msgs.length;
};

/**
 * Return the total length of all buffers.
 *
 * @return {String}
 * @api private
 */

Batch.prototype.length = function(){
  var ret = 0;
  var len = this.msgs.length;
  for (var i = 0; i < len; ++i) {
    ret += this.msgs[i].length;
  }
  return ret;
};

/**
 * Clear the batch buffer.
 *
 * @api private
 */

Batch.prototype.clear = function(){
  this.msgs = [];
};

/**
 * Return a `Buffer` containing all the buffered
 * messages as contiguous memory.
 *
 * TODO:
 *  look into optimizing this
 *  and do some better profiling. less .write()s
 *  really bumps our throughput for small-ish messages,
 *  however for larger ones these copies are terrible.
 *
 * @return {Buffer}
 * @api private
 */

Batch.prototype.toBuffer = function(){
  var buf = new Buffer(this.length());
  var len = this.msgs.length;
  var off = 0;
  var msg;
  for (var i = 0; i < len; ++i) {
    msg = this.msgs[i];
    msg.copy(buf, off, 0, msg.length);
    off += msg.length;
  }
  return buf;
};

