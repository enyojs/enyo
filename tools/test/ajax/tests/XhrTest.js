enyo.kind({
	name: "XhrTest",
	kind: enyo.TestSuite,
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
	}
});