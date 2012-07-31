
var ss = require('..')
  , encoder = new ss.Encoder
  , decoder = new ss.Decoder
  , should = require('should')
  , msgs;

// capture messages

decoder.onmessage = function(body, multi) {
  msgs.push({ body: body, multi: multi });
};


// test pack()

msgs = [];

decoder.write(encoder.pack('that is good tobi', 1));
decoder.write(encoder.pack({ super: 'sockets' }, 2));

msgs[0].body.toString().should.equal('that is good tobi');
msgs[1].body.super.should.equal('sockets');

// test multipart chaining

msgs = [];

var msg = encoder
  .multi()
  .pack('foo', 1)
  .pack('bar', 1)
  .pack({ hello: 'world' }, 2)
  .pack(new Buffer([0x73, 0x69, 0x63, 0x6b]), 1)
  .end();

decoder.write(msg);

msgs[0].body.should.be.instanceof(Array);
msgs[0].body.should.have.length(4);

msgs[0].body[0].toString().should.equal('foo');
msgs[0].body[1].toString().should.equal('bar');
msgs[0].body[2].hello.should.equal('world');
msgs[0].body[3].should.be.instanceof(Buffer);
msgs[0].body[3].toString().should.equal('sick');


