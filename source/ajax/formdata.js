/**

_enyo.FormData_ is an [XHR2](http://www.w3.org/TR/XMLHttpRequest/)
`FormData` implementation.  It is used to send `multipart/form-data`
Ajax requests.  _enyo.Blob_ is the associated content provider for
file-parts.

Note that in IE<10, both _enyo.FormData_ and _enyo.Blob_ are limited
to `String` content--an _enyo.Blob_ may only be instantiated using an
`Array` or `String`.

_enyo.FormData_ is inspired by
[html5-formdata](https://github.com/francois2metz/html5-formdata/blob/master/formdata.js).

    Emulate FormData for some browsers
    MIT License
    (c) 2010 Francois de Metz

 */
(function(w) {
	if (w.FormData) {
		try {
			var t1 = new w.FormData();
			var t2 = new w.Blob();
			// Android Chrome 18 will throw an error trying to create these
			enyo.FormData = w.FormData;
			enyo.Blob = w.Blob;
			return;
		}
		catch (e) {
			// ignore error and fall through to fake FormData code
		}
	}
	function FormData() {
		this.fake = true;
		this._fields = [];
		// This generates a 50 character boundary similar to
		// those used by Firefox.  They are optimized for
		// boyer-moore parsing.
		this.boundary = '--------------------------';
		for (var i = 0; i < 24; i++) {
			this.boundary += Math.floor(Math.random() * 10).toString(16);
		}
	}
	FormData.prototype.getContentType = function() {
		return "multipart/form-data; boundary=" + this.boundary;
	};
	FormData.prototype.append = function(key, value, filename) {
		this._fields.push([key, value, filename]);
	};
	FormData.prototype.toString = function() {
		var boundary = this.boundary;
		var body = "";
		enyo.forEach(this._fields, function(field) {
			body += "--" + boundary + "\r\n";
			if (field[2] || field[1].name) {
				// file upload
				var file = field[1], filename = field[2] || file.name;
				body += "Content-Disposition: form-data; name=\""+ field[0] +"\"; filename=\""+ filename +"\"\r\n";
				body += "Content-Type: "+ file.type +"\r\n\r\n";
				body += file.getAsBinary() + "\r\n";
			} else {
				// key-value field
				body += "Content-Disposition: form-data; name=\""+ field[0] +"\";\r\n\r\n";
				body += field[1] + "\r\n";
			}
		});
		body += "--" + boundary +"--";
		return body;
	};
	enyo.FormData = FormData;

	function Blob(inBufs, inOpts) {
		this.name = inOpts.name;
		this.type = inOpts.type || 'application/octet-stream';
		if (!enyo.isArray(inBufs)) {
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
	enyo.Blob = Blob;

})(window);
