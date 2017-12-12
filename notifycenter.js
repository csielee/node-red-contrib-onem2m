var util = require('util');
var events = require('events');

var NodifyCenter = function() {

}

util.inherits(NodifyCenter, events.EventEmitter);

var nc = new NodifyCenter();

module.exports = nc;