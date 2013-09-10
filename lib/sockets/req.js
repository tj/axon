
/**
 * Module dependencies.
 */

var Socket = require('./sock')
  , queue = require('../plugins/queue')
  , slice = require('../utils').slice
  , debug = require('debug')('axon:req');

/**
 * Expose `ReqSocket`.
 */

module.exports = ReqSocket;

/**
 * Initialize a new `ReqSocket`.
 *
 * @api private
 */

function ReqSocket() {
  Socket.call(this);
  this.n = 0;
  this.ids = 0;
  this.callbacks = {};
  this.identity = this.get('identity');
  this.use(queue());
  this.priorityMap = {};
  this.sockMap = {};
  this.priorities = [];
  this.priority = false;
  this.count = 0;
}

/**
 * Inherits from `Socket.prototype`.
 */

ReqSocket.prototype.__proto__ = Socket.prototype;

/**
 * Return a message id.
 *
 * @return {String}
 * @api private
 */

ReqSocket.prototype.id = function(){
  return this.identity + ':' + this.ids++;
};

/**
 * Emits the "message" event with all message parts
 * after the null delimeter part.
 *
 * @param {net.Socket} sock
 * @return {Function} closure(msg, multipart)
 * @api private
 */

ReqSocket.prototype.onmessage = function(){
  var self = this;
  return function(msg, multipart){
    if (!multipart) return debug('expected multipart: %j', msg);
    var id = msg.pop();
    var fn = self.callbacks[id];
    if (!fn) return debug('missing callback %s', id);
    fn.apply(null, msg);
    delete self.callbacks[id];
    if (self.priority) {
      var identity = id.split(":")[0];
      var sock = self.sockMap[identity];

      //remove from sorted list here
      remove(sock.count, self.priorities);

      var ri = self.priorityMap[sock.count].indexOf(identity);
      self.priorityMap[sock.count].splice(ri, 1);

      sock.count--;
      self.priorityMap[sock.count].push(identity);
    }
  };
};

/**
 * Sends `msg` to the remote peers. Appends
 * the null message part prior to sending.
 *
 * @param {Mixed} msg
 * @api public
 */

ReqSocket.prototype.send = function(msg){
  var socks = this.socks
    , len = socks.length
    , sock = null
    , identity = null
    , count = null
    , args = Array.isArray(msg)
      ? msg
      : slice(arguments);

  if (!this.priority) {
    sock = socks[this.n++ % len];
  } else {
    // time for the priority magic
    // step 1: if these numbers are not equal, then a new socket has connected
    // and not been sent anything. In this case, we should send something to
    // it.
    if (this.priorities.length != len) {
      // the value of n is always the "next" thing we should grab off the end
      // of the list
      sock = this.socks[this.n];
      identity = sock.identity;
      count = 1;
      this.n++;
    } else {
      // we are going to get something that is the least busy
      count = this.priorities[0].shift();

      // get the next id, which will be the first item in the count
      // priority list
      identity = this.priorityMap[count].shift();
      sock = this.sockMap[identity];
    }

    sock.count++;
    // insert the count into our priority list that is sorted
    insert(sock.count, this.priorities);

    // make sure out priorityMap has an array setup for this count
    if (this.priorityMap[sock.count] === undefined) {
      this.priorityMap[sock.count] = [];
    }

    this.priorityMap[sock.count].push(identity);

    this.sockMap[sock.identity] = sock;
  }

  if (sock) {
    var hasCallback = 'function' == typeof args[args.length - 1];
    if (!hasCallback) args.push(function(){});
    var fn = args.pop();
    fn.id = this.id();
    this.callbacks[fn.id] = fn;
    args.push(fn.id);
  }

  if (sock) {
    sock.write(this.pack(args));
  } else {
    debug('no connected peers');
    this.enqueue(args);
  }
};

/**
 * Turns on or off the priority strategy.
 *
 * @param {Boolean} on - is the strategy on or off
 * @api public
 */

ReqSocket.prototype.usePriority = function (on) {
  this.priority = on;
}

/**
 * Remove socket from the list of available sockets. This has been overridden
 * to remove it from the socket map as well.
 *
 * @param {Socket} sock
 * @api private
 */

ReqSocket.prototype.removeSocket = function (sock) {
  var i = this.socks.indexOf(sock);
  if (!~i) return;
  debug('remove socket %d', i);
  // remove this item from the socket map
  delete this.sockMap[this.socks[i].identity];
  this.socks.splice(i, 1);
}

/**
 * Find the location to insert the given element in a sorted array
 *
 * @param {Number} element - element to insert
 * @param {Array} array - array to insert into
 * @param {Number} start - index to start searching at
 * @param {Number} end - index to stop searching at
 * @api private
 */

function locationOf(element, array, start, end) {
  start = start || 0;
  end = end || array.length;
  var pivot = parseInt(start + (end - start) / 2);
  if(end-start <= 1 || array[pivot] == element) return pivot;
  if(array[pivot] < element) {
    return locationOf(element, array, pivot, end);
  } else{
    return locationOf(element, array, start, pivot);
  }
}

/**
 * Insert an element into a sorted array
 *
 * @param {Number} element - element to insert
 * @param {Array} array - array to insert element into
 * @return {Array} resulting array
 * @api private
 */

function insert(element, array) {
  array.splice(locationOf(element, array)+1, 0, element);
  return array;
}

/**
 * Remove an element from a sorted array
 *
 * @param {Number} element - element to remove
 * @param {Array} array - array to remove the element from
 * @return {Array} resulting array
 * @api private
 */

function remove(element, array) {
  array.splice(locationOf(element, array), 1);
  return array;
}
