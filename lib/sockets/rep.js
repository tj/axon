
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
    if (!multipart) return debug('expected multipart: %j', msg);

    var id = msg.pop();
    msg.unshift('message');
    msg.push(reply);
    self.emit.apply(self, msg);

    function reply() {
      var args = [].slice.call(arguments);
      args[0] = args[0] || null;
      args.push(id);
      
      if (sock.writable) {
        sock.write(self.pack(args));
        return true;
      } else {
        debug('peer went away');
        return false;
      }
    }
  };
};


