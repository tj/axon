
var ss = require('..')
  , parser = new ss.Parser
  , should = require('should')
  , msg;

// capture messages

parser.onmessage = function(body, multipart){
  msgs.push({ body: body, multipart: multipart });
};

// test well formed packets

msgs = [];

parser.write(new Buffer([0x01, 0x00, 0x00, 0x01, 0x30]));
parser.write(new Buffer([0x01, 0x00, 0x00, 0x01, 0x30]));
parser.write(new Buffer([0x01, 0x00, 0x00, 0x01, 0x30]));

for (var i = 0; i < 3; ++i) {
  msgs[i].body.toString().should.equal('0');
}

// test single bytes

msgs = [];

var bytes = [
  0x01, 0x00, 0x00, 0x01, 0x32,
  0x01, 0x00, 0x00, 0x01, 0x32,
  0x01, 0x00, 0x00, 0x01, 0x32,
  0x01, 0x00, 0x00, 0x01, 0x32,
  0x01, 0x00, 0x00, 0x01, 0x32];

for (var i = 0, len = bytes.length; i < len; ++i) {
  parser.write(new Buffer([bytes[i]]));
}

for (var i = 0; i < 5; ++i) {
  msgs[i].body.toString().should.equal('2');
}

// test well formed multipart

msgs = [];

parser.write(new Buffer([
  0x00, 0x00, 0x00, 0x12,
  0x01, 0x00, 0x00, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f,
  0x01, 0x00, 0x00, 0x05, 0x77, 0x6f, 0x72, 0x6c, 0x64
]));

msgs[0].body.should.be.instanceof(Array);
msgs[0].body.should.have.length(2);
msgs[0].body[0].toString().should.equal('hello');
msgs[0].body[1].toString().should.equal('world');


// test single byte multipart

msgs = [];

var bytes = [
  0x00, 0x00, 0x00, 0x12,
  0x01, 0x00, 0x00, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f,
  0x01, 0x00, 0x00, 0x05, 0x77, 0x6f, 0x72, 0x6c, 0x64
];

for (var i = 0, len = bytes.length; i < len; ++i) {
  parser.write(new Buffer([bytes[i]]));
}

msgs[0].body.should.be.instanceof(Array);
msgs[0].body.should.have.length(2);
msgs[0].body[0].toString().should.equal('hello');
msgs[0].body[1].toString().should.equal('world');











