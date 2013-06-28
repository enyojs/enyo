enyo.kind({
	name: "AsyncTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testAsyncExists: function() {
		new enyo.Async();
		this.finish();
	},
	testAsyncFail: function() {
		var a = new enyo.Async();
		a.response(this, function(inSender, inValue) {
			this.finish("error response not passed to success handler");
		});
		a.error(this, function() {
			this.finish();
		});
		a.fail("foo");
	},
	testAsyncInnerFail: function() {
		new enyo.Async()
			.response(function(inSender, inValue) {
				inSender.fail("always fail");
			})
			.error(this, function() {
				this.finish();
			})
			.respond("foo")
			;
	},
	testAsyncInnerFailRecover: function() {
		new enyo.Async()
			.response(function(inSender, inValue) {
				inSender.fail("first response always fails");
			})
			.error(function(inSender) {
				inSender.recover();
				return "recovery response";
			})
			.response(this, function(inSender, inValue) {
				this.finish(inValue == "recovery response" ? null : "fail");
			})
			.respond("foo")
			;
	}
});