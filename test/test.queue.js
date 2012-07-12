
var ss = require('..')
  , sock = ss.socket('queue')
  , should = require('should')
  , msgs;

// capture messages

sock.onmessage = function(msg, meta){
  msgs.push({ payload: msg, meta: meta });
};

// test well formed packets

msgs = [];

sock.frame(new Buffer([0x00, 0x00, 0x00, 0x01, 0x30]));
sock.frame(new Buffer([0x00, 0x00, 0x00, 0x01, 0x30]));
sock.frame(new Buffer([0x00, 0x00, 0x00, 0x01, 0x30]));

for (var i = 0; i < 3; ++i) {
  msgs[i].payload.toString().should.equal('0');
  msgs[i].meta.length.should.equal(1);
  msgs[i].meta.format.should.equal(0);
}

// test single bytes

msgs = [];

var bytes = [
  0x00, 0x00, 0x00, 0x01, 0x32,
  0x00, 0x00, 0x00, 0x01, 0x32,
  0x00, 0x00, 0x00, 0x01, 0x32,
  0x00, 0x00, 0x00, 0x01, 0x32,
  0x00, 0x00, 0x00, 0x01, 0x32];

for (var i = 0, len = bytes.length; i < len; ++i) {
  sock.frame(new Buffer([bytes[i]]));
}

for (var i = 0; i < 5; ++i) {
  msgs[i].meta.length.should.equal(1);
  msgs[i].meta.format.should.equal(0);
  msgs[i].payload.toString().should.equal('2');
}

// test pack()

msgs = [];

sock.frame(sock.pack('hello', 0));
sock.frame(sock.pack('how are you doing?', 0));
sock.frame(sock.pack('that is good tobo', 1));

msgs[0].payload.toString().should.equal('hello');
msgs[1].payload.toString().should.equal('how are you doing?');
msgs[2].payload.toString().should.equal('that is good tobo');

msgs[0].meta.length.should.equal(5);
msgs[1].meta.length.should.equal(18);
msgs[2].meta.length.should.equal(17);

msgs[0].meta.format.should.equal(0);
msgs[1].meta.format.should.equal(0);
msgs[2].meta.format.should.equal(1);

