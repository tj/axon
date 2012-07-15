
module.exports = Batch;

function Batch() {
  this.clear();
}

Batch.prototype.add = function(msg){
  this.msgs.push(msg);
};

Batch.prototype.length = function(){
  var ret = 0;
  var len = this.msgs.length;
  for (var i = 0; i < len; ++i) {
    ret += this.msgs[i].length;
  }
  return ret;
};

Batch.prototype.clear = function(){
  this.msgs = [];
};

Batch.prototype.toBuffer = function(){
  var buf = new Buffer(this.length());
  var len = this.msgs.length;
  var off = 0;
  var msg;
  for (var i = 0; i < len; ++i) {
    msg = this.msgs[i];
    msg.copy(buf, off, 0, msg.length);
    off += msg.length;
  }
  return buf;
};

