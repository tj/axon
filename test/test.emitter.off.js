
var ss = require('..')
  , should = require('should');

var pub = ss.socket('pub-emitter')
  , sub = ss.socket('sub-emitter');

pub.bind(4000);

var events = [];

sub.on('user:login', function () {
  events.push('user:login');
  sub.off('user:login');
});

sub.on('page:view', function () {
  events.push('page:view');
  sub.off('page:view');
});

sub.on('something:else', function () {
  events.push('something:else');
  sub.off('something:else');
});

sub.on('foo:bar', function () {
  events.push('foo:bar');
  events.map(String).should.eql(expected);
  if (expected === on) {
    events = [];
    expected = off;
    fireEvents();
  } else {
    pub.close();
    sub.close();
  }
});

sub.connect(4000, fireEvents);

function fireEvents() {
  pub.emit('user:login', 'tobi');
  pub.emit('page:view', '/home');
  pub.emit('something:else', 'pork');
  pub.emit('foo:bar', 'baz');
}

var on = [
  'user:login',
  'page:view',
  'something:else',
  'foo:bar'
];

var off = [
  'foo:bar'
];

var expected = on;