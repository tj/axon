
/**
 * Module dependencies.
 */

var axon = require('../')
  , assert = require('better-assert');

// socket types

assert(axon.socket('stream') instanceof axon.Socket);
assert(axon.socket('pub') instanceof axon.PubSocket);
assert(axon.socket('sub') instanceof axon.SubSocket);
assert(axon.socket('push') instanceof axon.PushSocket);
assert(axon.socket('pull') instanceof axon.PullSocket);
assert(axon.socket('sub-emitter') instanceof axon.SubEmitterSocket);
assert(axon.socket('pub-emitter') instanceof axon.PubEmitterSocket);

process.exit();
