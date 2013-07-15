enyo.kind({
	name: "JsonpTest",
	kind: enyo.TestSuite,
	noDefer: true,
	_testJsonp: function(inProps, inParams, inAssertFn) {
		return new enyo.JsonpRequest(inProps)
			.response(this, function(inSender, inValue) {
				this.finish(inAssertFn.call(null, inValue) ? "" : "bad response: " + JSON.stringify(inValue));
			})
			.error(this, function(inSender, inValue) {
				this.finish("bad status: " + inValue);
				enyo.error(inValue);
			})
			.go(inParams);
	},
	_testResponse: function(inProps, inAssertFn) {
		this._testJsonp(enyo.mixin({url: "php/test1.php?format=jsonp", callbackName: "callback"}, inProps),
			null, inAssertFn);
	},
	testJsonResponse: function() {
		this._testResponse({}, function(inValue) {
			return inValue.response == "hello";
		});
	},
	testCharset: function() {
		this._testResponse({charset: "utf8"}, function(inValue) {
			return inValue.utf8 == "\u0412\u0438\u0301\u0445\u0440\u0438";
		});
	},
	testOverrideCallbackName: function() {
		var originalCallback = this.bindSafely(function() {
			this.finish("didn't override callback method");
		});
		window.ONE_TIME_CALLBACK = originalCallback;
		this._testJsonp({
				url: "php/test1.php?format=jsonp",
				overrideCallback: "ONE_TIME_CALLBACK"
			},
			null,
			function(inValue) {
				// verify that my original name was stomped on
				return (window.ONE_TIME_CALLBACK !== originalCallback) && (inValue.response == "hello");
			}
		);
	}
});