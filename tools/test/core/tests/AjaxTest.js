enyo.kind({
	name: "AjaxTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testAjax200: function() {
		new enyo.Ajax({url: "index.html", handleAs: "text"})
			.response(this, function(inSender, inValue){
				this.finish();
			})
			.error(this, function(inSender, inValue) {
				this.finish("bad status: " + inValue);
			})
			.go();
	},
	testAjax404: function() {
		new enyo.Ajax({url: "noexist.not"})
			.response(this, function(inSender, inValue){
				this.finish("ajax failed to fail");
			})
			.error(this, function(inSender, inValue) {
				this.finish();
			})
			.go();
	},
	testAjaxCustomError: function() {
		new enyo.Ajax({url: "appinfo.json"})
			.response(function(inSender, inValue){
				inSender.fail("cuz I said so");
			})
			.error(this, function(inSender, inValue) {
				this.finish();
			})
			.go();
	},
	testAjaxSerial: function() {
		// if the test finishes before ready, it's a failure
		var ready = false;
		//
		// when 'index' request completes, we are 'ready'
		var index = new enyo.Ajax({url: "index.html", handleAs: "text"});
		index.response(function() {
			ready = true;
		});
		//
		// request triggers 'index' request when it completes
		new enyo.Ajax({url: "index.html", handleAs: "text"})
			.response(index)
			.response(this, function() {
				// finish clean if 'ready'
				this.finish(ready ? "" : "requests failed to complete in order");
			})
			.go();
	}
});