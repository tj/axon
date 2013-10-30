
/**
 * Deps
 */

var Socket = require('../sockets/sock')
  , debug = require('debug')('axon:req')
  , slice = require('../utils').slice;

/**
 * Priority Plugin. This will force a req/rep socket to send to the least busy
 * socket
 *
 * Overridden methods:
 *  - onmessage
 *  - send
 *  - removeSocket
 *  - onconnect
 *
 * @param {Object} options
 * @api private
 */

module.exports = function(options){
  options = options || {};
  var fallback = options.fallback || function(){};

  return function(sock){

    /**
     * Bind callback to `sock`.
     */

    fallback = fallback.bind(sock);

    /**
     * Initialize variables
     */

    sock.priorityMap = { '0' : [] };
    sock.sockMap = {};
    sock.priorities = [];

    /**
     * This is called when a message returns to dispatch the callback
     */

    sock.onmessage = function(){
      var self = this;
      return function(msg, multipart){
        if (!multipart) return debug('expected multipart: %j', msg);
        var id = msg.pop();
        var fn = self.callbacks[id];
        if (!fn) return debug('missing callback %s', id);

        var identity = parseInt(id.toString().split(":")[2]);
        var sock = self.sockMap[identity];

        //remove from sorted list here
        remove(sock.count, self.priorities);
        var ri = self.priorityMap[sock.count].indexOf(identity);
        self.priorityMap[sock.count].splice(ri, 1);

        sock.count--;
        self.priorityMap[sock.count].push(identity);
        insert(sock.count, self.priorities);

        fn.apply(null, msg);
        delete self.callbacks[id];
      };
    };

    /**
     * Sends `msg` to all connected peers in a prioritized fashion based off of
     * work load
     */

    sock.send = function(msg){
      var socks = this.socks
        , len = socks.length
        , sock = null
        , identity = null
        , count = null
        , args = Array.isArray(msg)
          ? msg
          : slice(arguments);

      // make sure there are actually connected sockets, if not, everything
      // goes into a queue, which will be flushed when there are sockets
      if (len) {
        // time for the priority magic
        // we are going to get something that is the least busy
        count = this.priorities.shift();

        // get the next id, which will be the first item in the count
        // priority list
        identity = this.priorityMap[count].shift();
        sock = this.sockMap[identity];

        sock.count++;
        // insert the count into our priority list that is sorted
        insert(sock.count, this.priorities);

        // make sure out priorityMap has an array setup for this count
        if (this.priorityMap[sock.count] === undefined) {
          this.priorityMap[sock.count] = [];
        }

        // make sure to move it from its old spot
        if (sock.count >= 0) {
          var old = sock.count - 1;
          var ri = this.priorityMap[old].indexOf(identity);
          if (ri != -1 ) {
            this.priorityMap[old].splice(ri, 1);
          }
        }

        this.priorityMap[sock.count].push(identity);
      }

      if (sock) {
        var hasCallback = 'function' == typeof args[args.length - 1];
        if (!hasCallback) args.push(function(){});
        var fn = args.pop();
        fn.id = this.id() + ":" + sock.identity;
        this.callbacks[fn.id] = fn;
        args.push(fn.id);
      }

      if (sock) {
        sock.write(this.pack(args));
      } else {
        debug('no connected peers');
        fallback(args);
      }
    };

    /*
     * Remove a socket from the available pool
     */

    sock.removeSocket = function (sock) {
      var i = this.socks.indexOf(sock);
      if (!~i) return;
      debug('remove socket %d', i);
      // remove this item from the socket map
      var identity = this.socks[i].identity;
      var count = this.socks[i].count;
      delete this.sockMap[identity];
      //remove priority from list and remove it in the priority map
      remove(count, this.priorities);
      var ri = this.priorityMap[count].indexOf(identity);
      this.priorityMap[count].splice(ri, 1);
      this.socks.splice(i, 1);
    }

    /**
     * Add a socket to the available pool
     */

    sock.onconnect = function (sock) {
      // add the count
      sock.count = 0;

      var self = this;
      var addr = sock.remoteAddress + ':' + sock.remotePort;
      sock.identity = this.sockIds++;

      // insert its priority into the list
      insert(0, this.priorities);
      this.priorityMap[0].push(sock.identity);
      this.sockMap[sock.identity] = sock;

      debug('accept %s', addr);
      this.addSocket(sock);
      this.handleErrors(sock);
      this.emit('connect', sock);
      sock.on('close', function(){
        debug('disconnect %s', addr);
        self.emit('disconnect', sock);
        self.removeSocket(sock);
      });
    }
  };
};

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
  if (end == 0) return 0;
  if (array[pivot] == element) return pivot;
  if (end-start <= 1 && array[pivot] < element) return pivot;
  if (end-start <= 1 && array[pivot] > element) return pivot - 1;
  if (array[pivot] < element) {
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
  array.splice(locationOf(element, array) + 1, 0, element);
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
