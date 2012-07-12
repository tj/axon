
/**
 * Module dependencies.
 */

var ss = require('../')
  , should = require('should');

// version

ss.version.should.match(/^\d+\.\d+\.\d+$/)

// socket types

ss.socket('stream').should.be.an.instanceof(ss.Socket);
ss.socket('pub').should.be.an.instanceof(ss.PubSocket);
ss.socket('sub').should.be.an.instanceof(ss.SubSocket);
ss.socket('push').should.be.an.instanceof(ss.PushSocket);
ss.socket('pull').should.be.an.instanceof(ss.PullSocket);

