/**

_enyo.FormData_ is an [XHR2](http://www.w3.org/TR/XMLHttpRequest/)
`FormData` implementation.  It is used to send `multipart/form-data`
Ajax requests.  _enyo.Blob_ is the associated content provider for
file-parts.

It is inspired by
[html5-formdata](https://github.com/francois2metz/html5-formdata/blob/master/formdata.js)

    Emulate FormData for some browsers
    MIT License
    (c) 2010 Francois de Metz

 */
(function(w) {
	if (w.FormData) {
		enyo.FormData = w.FormData;
		enyo.Blob = w.Blob;
		return;
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
		this._fields.forEach(function(field) {
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
		this._bufs = inBufs; // leave byte arrays un-touched
	}
	Blob.prototype.getAsBinary = function() {
		if (this._bufs instanceof String) {
			return ''.concat.apply(null, this._bufs);
		} else {
			throw new Error('enyo.Blob only handles Strings');
		}
	};
	enyo.Blob = Blob;

})(window);
