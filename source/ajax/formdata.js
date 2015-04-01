(function (enyo, scope) {

	/**
	* An [XHR2]{@linkplain http://www.w3.org/TR/XMLHttpRequest/} FormData implementation.
	* It is used to send `multipart/form-data` [Ajax]{@glossary ajax} requests. The
	* internal `enyo.Blob` [kind]{@glossary kind} is the content provider for file-parts.
	*
	* Note that in Internet Explorer < 10, both {@link enyo.FormData} and `enyo.Blob` are
	* limited to [string]{@glossary String} content and `enyo.Blob` may only be
	* instantiated using an [array]{@glossary Array} or [string]{@glossary String}.
	*
	* This implementation is inspired by
	* [html5-formdata]{@linkplain https://github.com/francois2metz/html5-formdata/blob/master/formdata.js}.
	*
	* ```
	* Emulate FormData for some browsers
	* MIT License
	* (c) 2010 Francois de Metz
	* ```
	*
	* @class enyo.FormData
	* @public
	*/
	if (scope.FormData) {
		try {
			new scope.FormData();
			new scope.Blob();
			
			// Android Chrome 18 will throw an error trying to create these
			enyo.FormData = scope.FormData;
			enyo.Blob = scope.Blob;
		} catch (e) {}
	}
	
	if (!(enyo.FormData && enyo.Blob)) {
		
		/*jshint -W082 */
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
		/*jshint +W082 */
	}
	
})(enyo, this);