
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , debug = require('debug')('axon:rep');

/**
 * Expose `RepSocket`.
 */

module.exports = RepSocket;

/**
 * Initialize a new `RepSocket`.
 *
 * @api private
 */

function RepSocket() {
  Socket.call(this);
}

/**
 * Inherits from `Socket.prototype`.
 */

RepSocket.prototype.__proto__ = Socket.prototype;

/**
 * Incoming.
 *
 * @param {net.Socket} sock
 * @return {Function} closure(msg, mulitpart)
 * @api private
 */

RepSocket.prototype.onmessage = function(sock){
  var self = this;
  return function (msg, multipart){
    if (!multipart) return debug('rep expects multipart');
    var envelopes = [];

    for (var i = 0; i < msg.length; ++i) {
      if (0x00 === msg[i][0]) {
        envelopes = msg.splice(0, ++i);
      }
    }

    self.emit.apply(self, ['message'].concat(msg, reply));

    function reply(){
      var args = [].slice.call(arguments);
      sock.write(self.pack(envelopes.concat(args)));
    }
  };
};


