
/**
 * Round-robin plugin.
 *
 * Provides a `send` method which will
 * write the `msg` to all connected peers.
 *
 * @param {Object} options
 * @api private
 */

module.exports = function(options){
  options = options || {};
  fallback = options.fallback || function(){};

  return function(sock){

    /**
     * Bind callback to `sock`.
     */

    fallback = fallback.bind(sock);

    /**
     * Initialize counter.
     */

    var n = 0;

    /**
     * Sends `msg` to all connected peers.
     */

    sock.send = function(msg){
      var socks = this.socks
        , len = socks.length
        , sock = socks[n++ % len];

      if (sock) {
        sock.write(this.pack(msg));
      } else {
        fallback(msg);
      }
    };

  };
};