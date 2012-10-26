enyo.kind({
	name: "AjaxTest",
	kind: enyo.TestSuite,
	timeout: 10000,
	_testAjax: function(inProps, inParams, inAssertFn) {
		return new enyo.Ajax(inProps)
			.response(this, function(inSender, inValue) {
				this.finish(inAssertFn.call(null, inValue) ? "" : "bad response: " + inValue);
			})
			.error(this, function(inSender, inValue) {
				this.finish("bad status: " + inValue);
				console.error(inValue);
			})
			.go(inParams);
	},
	_testResponse: function(inProps, inAssertFn) {
		this._testAjax(enyo.mixin({url: "php/test1.php?format=" + inProps.handleAs}, inProps), null, inAssertFn);
	},
	testJsonResponse: function() {
		this._testResponse({handleAs: "json"}, function(inValue) {
			return inValue.response == "hello";
		});
	},
	testTextResponse: function() {
		this._testResponse({handleAs: "text"}, function(inValue) {
			return inValue == "hello";
		});
	},
	testXmlResponse: function() {
		this._testResponse({handleAs: "xml"}, function(inValue) {
			var r = inValue.getElementsByTagName("response")[0].childNodes[0].nodeValue;
			return r == "hello";
		});
	},
	testSyncTextResponse: function() {
		this._testResponse({handleAs: "text", sync: true}, function(inValue) {
			return inValue == "hello";
		});
	},
	testPostRequest: function() {
		this._testAjax({url: "php/test2.php", method: "POST"}, {query: "enyo"}, function(inValue) {
			return inValue.response == "enyo";
		});
	},
	testPutRequest: function() {
		this._testAjax({url: "php/test2.php", method: "PUT"}, null, function(inValue) {
			return inValue.status == "put";
		});
	},
	testDeleteRequest: function() {
		this._testAjax({url: "php/test2.php", method: "DELETE"}, null, function(inValue) {
			return inValue.status == "delete";
		});
	},
	testHeader: function() {
		this._testAjax({url: "php/test2.php", method: "POST", headers: {"X-Requested-With": "XMLHttpRequest"}}, {query: "enyo"}, function(inValue) {
			return inValue.isAjax;
		});
	},
	testPostBody: function() {
		this._testAjax({url: "php/test2.php", method: "POST", postBody: "This is a test."}, null, function(inValue) {
			return inValue.response == "This is a test.";
		});
	},
	testContentType: function() {
		var contentType = "text/plain";
		this._testAjax({url: "php/test2.php", method: "PUT", contentType: contentType}, null, function(inValue) {
			return inValue.ctype == contentType;
		});
	},
	testXhrStatus: function() {
		var ajax = this._testAjax({url: "php/test2.php"}, null, function(inValue) {
			return ajax.xhr.status == 200;
		});
	},
	testXhrFields: function() {
		var ajax = this._testAjax({url: "php/test2.php", xhrFields: {withCredentials: true}}, null, function(inValue) {
			return ajax.xhr.withCredentials;
		});
	},
	// test CORS (Cross-Origin Resource Sharing) by testing against youtube api
	testCORS: function() {
		this._testAjax({url: "http://query.yahooapis.com/v1/public/yql/jonathan/weather/"}, {q:'select * from weather.forecast where location=94025', format: "json"}, function(inValue) {
			return inValue && inValue.query && inValue.query.results && inValue.query.count > 0;
		});
	},
	// test CORS failure
	testCORSFailure: function() {
		new enyo.Ajax({url: "https://dev.virtualearth.net/REST/v1/Locations/47.64054,-122.12934"})
			.response(this, function(inSender, inValue) {
				this.finish("CORS failure flagged as success");
			})
			.error(this, function(inSender, inValue) {
				this.finish("");
			})
			.go();
	},
	// server is set to respond after 3 seconds, so make sure timeout fires first
	testAjaxTimeout: function() {
		new enyo.Ajax({url: "php/test3.php", timeout: 500})
			.response(this, function(inSender, inValue) {
				this.finish("did not timeout");
			})
			.error(this, function(inSender, inValue) {
				enyo.job("timeouttest", enyo.bind(this, function() {this.finish("");}), 4000);
			})
			.go();
	}
});