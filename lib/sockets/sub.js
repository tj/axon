
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , debug = require('debug')('axon:sub')
  , escape = require('escape-regexp');

/**
 * Expose `SubSocket`.
 */

module.exports = SubSocket;

/**
 * Initialize a new `SubSocket`.
 *
 * @api private
 */

function SubSocket() {
  Socket.call(this);
  this.subscriptions = [];
}

/**
 * Inherits from `Socket.prototype`.
 */

SubSocket.prototype.__proto__ = Socket.prototype;

/**
 * Check if this socket has subscriptions.
 *
 * @return {Boolean}
 * @api public
 */

SubSocket.prototype.hasSubscriptions = function(){
  return !! this.subscriptions.length;
};

/**
 * Check if any subscriptions match `topic`.
 *
 * @param {String} topic
 * @return {Boolean}
 * @api public
 */

SubSocket.prototype.matches = function(topic){
  for (var i = 0; i < this.subscriptions.length; ++i) {
    if (this.subscriptions[i].test(topic)) {
      return true;
    }
  }
  return false;
};

/**
 * Message handler.
 *
 * @param {net.Socket} sock
 * @return {Function} closure(msg, mulitpart)
 * @api private
 */

SubSocket.prototype.onmessage = function(sock){
  var self = this;
  var patterns = this.subscriptions;

  if (this.hasSubscriptions()) {
    return function(msg, multipart){
      var topic = multipart
        ? msg[0].toString()
        : msg.toString();

      if (!self.matches(topic)) return debug('not subscribed to "%s"', topic);
      self.emit.apply(self, ['message'].concat(msg));
    }
  }

  return Socket.prototype.onmessage.call(this, sock);
};

/**
 * Subscribe with the given `re`.
 *
 * @param {RegExp|String} re
 * @return {RegExp}
 * @api public
 */

SubSocket.prototype.subscribe = function(re){
  debug('subscribe to "%s"', re);
  this.subscriptions.push(re = toRegExp(re));
  return re;
};

/**
 * Unsubscribe with the given `re`.
 *
 * @param {RegExp|String} re
 * @api public
 */

SubSocket.prototype.unsubscribe = function(re){
  debug('unsubscribe from "%s"', re);
  re = toRegExp(re);
  for (var i = 0; i < this.subscriptions.length; ++i) {
    if (regexSame(this.subscriptions[i], re)) {
      this.subscriptions.splice(i--, 1);
    }
  }
};

/**
 * Clear current subscriptions.
 *
 * @api public
 */

SubSocket.prototype.clearSubscriptions = function(){
  this.subscriptions = [];
};

/**
 * Subscribers should not send messages.
 */

SubSocket.prototype.send = function(){
  throw new Error('subscribers cannot send messages');
};

/**
 * Convert `str` to a `RegExp`.
 *
 * @param {String} str
 * @return {RegExp}
 * @api private
 */

function toRegExp(str) {
  if (str instanceof RegExp) return str;
  str = escape(str);
  str = str.replace(/\\\*/g, '(.+)');
  return new RegExp('^' + str + '$');
}

/**
 * Determine if RegExp's `r1` and `r2` are identical content-wise.
 *
 * @param {RegExp} r1
 * @param {RegExp} r2
 * @return {Boolean}
 * @api private
 */

function regexSame(r1, r2) {
  if (r1 instanceof RegExp && r2 instanceof RegExp) {
    var props = ["global", "multiline", "ignoreCase", "source"];
    for (var i = 0; i < props.length; ++i) {
      var prop = props[i];
      if (r1[prop] !== r2[prop]) return false;
    }
    return true;
  }
  return false;
}