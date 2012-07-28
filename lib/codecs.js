
/**
 * Current id.
 */

var id = 1;

/**
 * Max codecs.
 */

var max = 9;

/**
 * Name map.
 */

var names = {};

/**
 * Define codec `name` with encode and decode functions.
 *
 * @param {String} name
 * @param {Object} fns
 * @api public
 */

exports.define = function(name, fns){
  if ('string' != typeof name) throw new Error('codec name required');
  if ('function' != typeof fns.encode) throw new Error('codec .encode required');
  if ('function' != typeof fns.decode) throw new Error('codec .decode required');
  if (id === max) throw new Error('too many codecs');

  exports[name] = {
    encode: fns.encode,
    decode: fns.decode,
    name: name,
    id: id++
  };

  names[exports[name].id] = name;
};

/**
 * Get codec by `id`.
 *
 * @param {Number} id
 * @return {Object}
 * @api public
 */

exports.byId = function(id){
  return exports[names[id]];
};

/**
 * Get codec by `name`.
 *
 * @param {String} name
 * @return {Object}
 * @api public
 */

exports.byName = function(name){
  return exports[name];
};

/**
 * Binary.
 */

exports.define('none', {
  encode: function(msg){ return msg },
  decode: function(msg){ return msg }
});

/**
 * JSON.
 */

exports.define('json', {
  encode: JSON.stringify,
  decode: JSON.parse
});