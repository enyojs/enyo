enyo.kind({
	name: "AjaxTest",
	kind: enyo.TestSuite,
	timeout: 10000,
	_testAjax: function(inProps, inParams, inAssertFn, inAssertErrFn) {
		return new enyo.Ajax(inProps)
			.response(this, function(inSender, inValue) {
				this.finish(inAssertFn.call(null, inValue) ? "" : "bad response: " + inValue);
			})
			.error(this, function(inSender, inError) {
				if (!inAssertErrFn) {
					this.finish("bad status: " + inError.toString());
					enyo.error(inError);
				} else {
					this.finish(inAssertErrFn.call(null, inError) ? "" : "bad response: " + inError);
				}
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
    testPostRequestQuery: function() {
        this._testAjax({url: "php/test2.php", method: "POST"}, {query: "enyo"}, function(inValue) {
            return inValue.response == "query.enyo";
        });
    },
    testPostRequestQueryWithPayload: function() {
        this._testAjax({url: "php/test2.php", method: "POST", postBody:"data"}, {query: "enyo"}, function(inValue) {
            return inValue.response == "query.enyo";
        });
    },
    testPostRequestPayload: function() {
        this._testAjax({url: "php/test2.php", method: "POST", postBody:"query=enyo"}, null, function(inValue) {
            return inValue.response == "post.enyo";
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
	testContentTypeDefault: function() {
		var contentType = "application/x-www-form-urlencoded";
		this._testAjax({url: "php/test4.php", method: "POST", postBody: "data"}, null, function(inValue) {
			var status = (inValue.ctype.indexOf(contentType) === 0);
			if (!status) {
				enyo.log("Bad CT: " + inValue.ctype + " expected: " + contentType);
			}
			return status;
		});
	},
	testContentTypeFormData: function() {
		if (window.FormData) {
			var formData = new FormData();
			formData.append('token', "data");
			var contentType = "multipart/form-data";
			this._testAjax({url: "php/test4.php", method: "POST", postBody: formData}, null, function(inValue) {
				var status = (inValue.ctype.indexOf(contentType) === 0) &&
								(inValue.ctype.indexOf("boundary=--") > 10);
				if (!status) {
					enyo.log("Bad CT: " + inValue.ctype + " expected: " + contentType);
				}
				return status;
			});
		} else {
			// We are probably on IE which does not support XHR2 and FormData before IE 10
			// See http://caniuse.com/#search=xhr2
			this.finish("");
		}
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
				// extra timeout is to make sure that timeout fail code cancels XHR
				enyo.job("timeouttest", enyo.bind(this, function() {this.finish("");}), 4000);
			})
			.go();
	},
	// expected to fail
	testErrorResponse: function() {
		var req = this._testAjax({url: "php/test5.php"}, null, function(inValue) {
			// getting success means server sent wrong response
			return false;
		}, function(inError) {
			return (inError === 500) && 
				req.xhrResponse && 
				(req.xhrResponse.status === 500) &&
				(req.xhrResponse.headers['content-type'] === "text/plain; charset=utf-8") &&
				(req.xhrResponse.body === "my error description");
		});
	}
});