
/**
 * Binary.
 */

exports.none = {
  encode: function(msg){ return msg },
  decode: function(msg){ return msg }
};

/**
 * JSON.
 */

exports.json = {
  encode: JSON.stringify,
  decode: JSON.parse
};