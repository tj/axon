
/**
 * Module dependencies.
 */

var debug = require('debug')('axon:queue');

/**
 * Queue plugin.
 *
 * Provides an `enqueue` method to the `sock`. Messages
 * passed to `enqueue` will be buffered until the next
 * `connect` event is emitted.
 *
 * TODO: HWM via `opts`?
 *
 * @param {Object} options
 * @api private
 */

module.exports = function(options){
  options = options || {};

  return function(sock){

    /**
     * Message buffer.
     */

    var buf = [];

    /**
     * Flush `buf` on `connect`.
     */

    sock.on('connect', function(){
      var len = buf.length;
      debug('flush %d messages', len);
      for (var i = 0; i < len; ++i) {
        this.send(buf[i]);
      }
      buf = [];
    });

    /**
     * Pushes `msg` into `buf`.
     */

    sock.enqueue = function(msg){
      buf.push(msg);
    };

  };
};