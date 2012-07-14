
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , Parser = require('../parser')
  , net = require('net');

/**
 * Expose `Queue`.
 */

exports = module.exports = Queue;

/**
 * Initialize a new `Queue`.
 *
 * The "Queue" encapsulates message packing & framing,
 * and applying of codecs for each message received.
 *
 * @api private
 */

function Queue() {
  Socket.call(this);
  var self = this;
  var sock = this.sock;
  this.socks = [];
  this.buf = [];
  this.parser = new Parser;
  this.format('none');
  sock.setNoDelay();
  sock.on('data', this.frame.bind(this));
  sock.on('connect', this.flush.bind(this));
  this.parser.onmessage = function(msg){
    self.emit('message', msg);
  };
}

/**
 * Inherit from `Socket.prototype`.
 */

Queue.prototype.__proto__ = Socket.prototype;

/**
 * Set format to `type`.
 *
 * @param {String} type
 * @return {Queue}
 * @api public
 */

Queue.prototype.format = function(type){
  this.parser.format(type);
  return this;
};

/**
 * Frame the given `chunk`.
 *
 * @param {Buffer} chunk
 * @api private
 */

Queue.prototype.frame = function(chunk){
  this.parser.write(chunk);
};

/**
 * Flush queued messages.
 *
 * @api private
 */

Queue.prototype.flush = function(){
  var buf = this.buf;
  var len = buf.length;
  this.buf = [];
  for (var i = 0; i < len; ++i) {
    this.send(buf[i]);
  }
};

/**
 * Close the server.
 *
 * @api public
 */

Queue.prototype.close = function(){
  this.server && this.server.close();
  return Socket.prototype.close.call(this);
};

/**
 * Remove `sock`.
 *
 * @param {Socket} sock
 * @api private
 */

Queue.prototype.removeSocket = function(sock){
  var i = this.socks.indexOf(sock);
  this.socks.splice(i, 1);
};

/**
 * Add `sock`.
 *
 * @param {Socket} sock
 * @api private
 */

Queue.prototype.addSocket = function(sock){
  var self = this;
  var parser = new Parser;
  this.socks.push(sock);
  sock.on('data', parser.write.bind(parser));
  parser.onmessage = function(msg){
    self.emit('message', msg);
  };
};

/**
 * Bind to `port` and invoke `fn()`.
 *
 * Emits:
 *
 *  - `connection` when a connection is accepted
 *  - `bind` when bound and listening
 *
 * TODO: host
 *
 * @param {Number} port
 * @param {Function} fn
 * @api public
 */

Queue.prototype.bind = function(port, fn){
  var self = this;
  this.type = 'server';

  this.server = net.createServer(function(sock){
    self.addSocket(sock);
    self.emit('connection', sock);
    sock.on('close', function(){
      self.removeSocket(sock);
    });
  });

  this.server.on('listening', function(){
    self.emit('bind');
  });

  this.server.listen(port, fn);
};
