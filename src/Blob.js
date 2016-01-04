require('enyo');

/**
* A polyfill for IE < 10. Returns the Browser's implementation of Blob, if available.
*
* @module enyo/Blob
* @public
*/

var
	utils = require('./utils');

exports = null;

if (typeof Blob != 'undefined') {
	try {
		new Blob();
		exports = module.exports = Blob;
	} catch (e) {}
}

if (!exports) {
	module.exports = _Blob;
}

function _Blob(inBufs, inOpts) {
	this.name = inOpts.name;
	this.type = inOpts.type || 'application/octet-stream';
	if (!utils.isArray(inBufs)) {
		throw new Error('enyo.Blob only handles Arrays of Strings');
	}
	if ((inBufs.length > 0) && typeof inBufs[0] !== 'string') {
		throw new Error('enyo.Blob only handles Arrays of Strings');
	}
	this._bufs = inBufs; // leave byte arrays un-touched
}

_Blob.prototype.getAsBinary = function() {
	var empty = '',
		content = empty.concat.apply(empty, this._bufs);
	return content;
};
