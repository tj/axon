
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , Stream = require('./stream')
  , slice = require('../utils').slice
  , queue = require('../plugins/queue')
  , roundrobin = require('../plugins/round-robin')
  , debug = require('debug')('axon:channel');

/**
 * Expose `Channel`.
 */

module.exports = Channel;

/**
 * Initialize a new `Channel`.
 *
 * @api private
 */

function Channel() {
  Socket.call(this);
  this.streams = {};
  this.use(queue());
  this.use(roundrobin({ fallback: this.enqueue }));
}

/**
 * Inherits from `Channel.prototype`.
 */

Channel.prototype.__proto__ = Socket.prototype;

/**
 * Create a new `Stream` on this channel.
 *
 * @param {String} [id]
 * @return {Stream}
 * @api public
 */

Channel.prototype.stream = function(id){
  var stream = new Stream(this, id);
  this.streams[stream.id] = stream;
  if (!id) this.send('stream', stream.id);
  return stream;
};

/**
 * Message handler.
 *
 * @param {net.Socket} sock
 * @return {Function} closure(msg, mulitpart)
 * @api private
 */

Channel.prototype.onmessage = function(){
  var self = this;
  var listeners = this.listeners;

  return function(msg, multipart){
    var id = msg[0];

    // initialize stream
    if ('stream' == id) {
      id = msg[1];
      debug('initialize stream %s', id);
      var stream = self.stream(id);
      self.emit('stream', stream);
      return;
    }
    
    // teardown stream
    if ('end' == id) {
      id = msg[1];
      var stream = self.streams[id];
      if (!stream) return debug('no stream %s', id);
      debug('destroy stream %s', id);
      stream.emit('end');
      delete self.streams[id];
      return;
    }
    
    // message
    var stream = self.streams[id];
    if (!stream) return debug('no stream %s', id);
    msg[0] = 'data';
    stream.emit.apply(stream, msg);
  }
};
