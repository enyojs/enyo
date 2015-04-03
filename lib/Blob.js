require('enyo');

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

	function Blob(inBufs, inOpts) {
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

	Blob.prototype.getAsBinary = function() {
		var empty = '',
			content = empty.concat.apply(empty, this._bufs);
		return content;
	};

	module.exports = Blob;
}