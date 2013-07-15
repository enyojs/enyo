enyo.kind({
	name: "WebServiceTest",
	kind: enyo.TestSuite,
	noDefer: true,
	timeout: 10000,
	_testWebService: function(inProps, inParams, inAssertFn) {
		var ws = this.createComponent({kind: enyo.WebService, onResponse: "_response", onError: "_error", assertFn: inAssertFn}, inProps);
		return ws.send(inParams);
	},
	_response: function(inSender, inValue) {
		this.finish(inSender.assertFn(inValue.data) ? "" : "bad response: " + JSON.stringify(inValue.data));
	},
	_error: function(inSender, inValue) {
		this.finish("bad status: " + inValue.data);
	},
	_testResponse: function(inProps, inAssertFn) {
		this._testWebService(enyo.mixin({url: "php/test1.php?format=" + (inProps.format || inProps.handleAs)}, inProps), null, inAssertFn);
	},
	testJsonResponse: function() {
		this._testResponse({handleAs: "json"},
			function(inValue) {
				return inValue.response == "hello";
			}
		);
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
	testPostRequest: function() {
		this._testWebService({url: "php/test2.php", method: "POST"}, {query: "enyo"}, function(inValue) {
			return inValue.response == "query.enyo";
		});
	},
	testPutRequest: function() {
		this._testWebService({url: "php/test2.php", method: "PUT"}, null, function(inValue) {
			return inValue.status == "put";
		});
	},
	testDeleteRequest: function() {
		this._testWebService({url: "php/test2.php", method: "DELETE"}, null, function(inValue) {
			return inValue.status == "delete";
		});
	},
	testHeader: function() {
		this._testWebService({url: "php/test2.php", method: "POST", headers: {"X-Requested-With": "XMLHttpRequest"}}, {query: "enyo"}, function(inValue) {
			return inValue.isAjax;
		});
	},
	testPostBody: function() {
		this._testWebService({url: "php/test2.php", method: "POST", postBody: "This is a test."}, null, function(inValue) {
			return inValue.response == "This is a test.";
		});
	},
	testContentType: function() {
		var contentType = "text/plain";
		this._testWebService({url: "php/test2.php", method: "PUT", contentType: contentType}, null, function(inValue) {
			return inValue.ctype == contentType;
		});
	},
	testXhrStatus: function() {
		var ajax = this._testWebService({url: "php/test2.php"}, null, function(inValue) {
			return ajax.xhr.status == 200;
		});
	},
	testXhrFields: function() {
		var ajax = this._testWebService({url: "php/test2.php", xhrFields: {withCredentials: true}}, null, function(inValue) {
			return ajax.xhr.withCredentials;
		});
	},
	// test CORS (Cross-Origin Resource Sharing) by testing against youtube api
	testCORS: function() {
		this._testWebService({
				url: "http://query.yahooapis.com/v1/public/yql/jonathan/weather/"
			}, {
				q: 'select * from weather.forecast where location=94025',
				format: "json"
			}, function(inValue) {
				return inValue && inValue.query && inValue.query.results && inValue.query.count > 0;
			});
	},
	testJsonp: function() {
		this._testResponse({jsonp: true, format: "jsonp"}, function(inValue) {
			return inValue.response == "hello";
		});
	},
	/*testCharset: function() {
		this._testResponse({charset: "utf8"}, function(inValue) {
			return inValue.utf8 == "\u0412\u0438\u0301\u0445\u0440\u0438";
		});
	}
	*/
	// server is set to respond after 3 seconds, so make sure timeout fires first
	_timeoutResponse: function(inSender, inEvent) {
		this.finish("did not timeout");
	},
	_timeoutError: function(inSender, inEvent) {
		// extra timeout is to make sure that timeout fail code cancels XHR
		enyo.job("wstimeouttest", this.bindSafely(function() {this.finish("");}), 4000);
	},
	testTimeout: function() {
		var ws = this.createComponent({kind: enyo.WebService,
			onResponse: "_timeoutResponse", onError: "_timeoutError"},
			{url: "php/test3.php", timeout: 500});
		ws.send();
	}
});