
var ss = require('..')
  , should = require('should')
  , Message = ss.Message
  , msg
  , buf
  , expected;

// text

msg = new Message;

expected = [
  0x01, 0x00, 0x00, 0x03,
  0x68, 0x61, 0x69
];

msg.write('hai');
buf = msg.toBuffer();

buf.should.have.length(expected.length);

for (var i = 0; i < expected.length; i++) {
  buf[i].should.equal(expected[i]);
}

// text -- constuctor

msg = new Message('hai');

expected = [
  0x01, 0x00, 0x00, 0x03,
  0x68, 0x61, 0x69
];

buf = msg.toBuffer();

buf.should.have.length(expected.length);

for (var i = 0; i < expected.length; i++) {
  buf[i].should.equal(expected[i]);
}

// binary

msg = new Message;

expected = [
  0x01, 0x00, 0x00, 0x03,
  0x68, 0x61, 0x69
];

msg.write(new Buffer([0x68, 0x61, 0x69]));

buf = msg.toBuffer();

buf.should.have.length(expected.length);

for (var i = 0; i < expected.length; i++) {
  buf[i].should.equal(expected[i]);
}

// "json"

msg = new Message;

expected = [
  0x02, 0x00, 0x00, 0x0b,
  0x7b, 0x22, 0x6b, 0x22, 0x3a, 0x22, 0x74, 0x68, 0x78, 0x22, 0x7d
];

msg.write(ss.codec.json.encode({ k: 'thx' }), ss.codec.json.id);

buf = msg.toBuffer();

for (var i = 0; i < expected.length; i++) {
  buf[i].should.equal(expected[i]);
}

// multipart -- multiple writes

msg = new Message

expected = [
  0x00, 0x00, 0x00, 0x18,
  0x01, 0x00, 0x00, 0x03,
  0x68, 0x65, 0x79, 0x01,
  0x00, 0x00, 0x05, 0x74,
  0x68, 0x65, 0x72, 0x65,
  0x01, 0x00, 0x00, 0x04,
  0x74, 0x6f, 0x62, 0x69
];

msg.write('hey');
msg.write('there');
msg.write('tobi');

buf = msg.toBuffer();

buf.should.have.length(expected.length);

for (var i = 0; i < expected.length; i++) {
  buf[i].should.equal(expected[i]);
}

// multipart -- 2 formats

msg = new Message;

expected = [
  0x00, 0x00, 0x00, 0x16,
  0x01, 0x00, 0x00, 0x03,
  0x68, 0x65, 0x79, 0x02,
  0x00, 0x00, 0x0b, 0x7b,
  0x22, 0x6b, 0x22, 0x3a,
  0x22, 0x74, 0x68, 0x78,
  0x22, 0x7d
];

msg.write('hey');
msg.write(ss.codec.json.encode({ k: 'thx' }), ss.codec.json.id);

buf = msg.toBuffer();

for (var i = 0; i < expected.length; i++) {
  buf[i].should.equal(expected[i]);
}