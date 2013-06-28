enyo.kind({
	name: "XhrTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testXhrSync: function() {
		var x = enyo.xhr.request({
			url: "php/test1.php?format=text",
			sync: true
		});
		if (x.responseText) {
			this.finish("");
		}
		else {
			this.finish("sync XHR didn't return with text");
		}
	},
	testXhrArrayBuffer: function() {
		var self = this;
		enyo.xhr.request({
			url: "php/test8.php",
			method: "POST",
			sync: false,
			body: new Uint8Array([]),
			headers: {"Content-Type": "application/x-amf; charset=UTF-8"},
			xhrFields: {responseType: "arraybuffer"},
			callback: function (inText, inXhr) {
				if (inXhr.response instanceof ArrayBuffer) {
					self.finish("");
				} else {
					self.finish("response is not an ArrayBuffer");
				}
			}
		});
	}
});