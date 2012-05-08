enyo.kind({
	name: "AsyncTest",
	kind: enyo.TestSuite,
	testAsyncExists: function() {
		new enyo.Async();
		this.finish();
	},
	/*
	testDefer: function() {
		var a = new enyo.Defer(200);
		a.response(function(inSender, inValue) {
			return inValue + " there";
		});
		a.response(this, function(inSender, inValue) {
			this.finish(inValue == "hi there" ? "" : "bad value");
		});
		a.go("hi");
	},
	testSerialAsync: function() {
		var b = new enyo.Defer(200);
		b.response(function(inSender, inValue) {
			return inValue + " again";
		});
		//
		var a = new enyo.Defer(200);
		a.response(function(inSender, inValue) {
			return inValue + " there";
		});
		a.response(b);
		a.response(this, function(inSender, inValue) {
			if (inValue == "hi there again") {
				this.finish();
			}
		});
		//
		a.go("hi");
	},
	testAsyncValue: function() {
		var test = this;
		new enyo.AsyncValue(42)
			.response(function(inSender, inValue) {
				if (inValue == 42) {
					test.finish();
				} else {
					test.finish("received [" + inValue + "] which is not == 42");
				}
			})
			.go()
			;
	},
	*/
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
	},
	/*
	testService: function() {
		new enyo.AsyncService()
			.transaction()
			.response(this, function(inSender, inValue) {
				this.finish();
			})
			.error(this, function() {
				this.finish("error");
			})
			.respond("foo")
			;
	},
	*/
});