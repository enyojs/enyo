enyo.kind({
	name: "AjaxTest",
	kind: enyo.TestSuite,
	noDefer: true,
	timeout: 10000,
	testContextSuccess: function (){
		var self = this;
		var context = {testStatus: 'success'};
		return new enyo.Ajax({url: "php/test1.php?format=test"})
			.response(context, function(inSender, inValue) {
				if (this.testStatus && this.testStatus === 'success') {
					self.finish("");
				} else {
					self.finish("response context not correctly bound");
				}
			})
			.error(context, function(inSender, inError) {
				self.finish("simple request failed");
			})
			.go();
	},
	testContextFailure: function (){
		var self = this;
		var context = {testStatus: 'success'};
		return new enyo.Ajax({url: "php/nowhere.php"})
			.response(context, function(inSender, inValue) {
				self.finish("simple request failed");
			})
			.error(context, function(inSender, inError) {
				if (this.testStatus && this.testStatus === 'success') {
					self.finish("");
				} else {
					self.finish("failure context not correctly bound");
				}
			})
			.go();
	},
	_testAjax: function(inProps, inParams, inAssertFn, inAssertErrFn) {
		return new enyo.Ajax(inProps)
			.response(this, function(inSender, inValue) {
				this.finish(inAssertFn.call(null, inValue) ? "" : "bad response: " + JSON.stringify(inValue));
			})
			.error(this, function(inSender, inError) {
				if (!inAssertErrFn) {
					this.finish("bad status: " + inError.toString());
					enyo.error(inError);
					enyo.error(inError.stack);
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
	// try a post with query object
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
			return (inValue.ctype === contentType);
		});
	},
	testCacheControlOn: function() {
		// skip test on non-iOS platforms, since Firefox always sends cache-control header causing
		// false positive
		if (!enyo.platform.ios) {
			this.finish();
			return;
		}
		this._testAjax({url: "php/test4.php", method: "POST", postBody: "data"}, null, function(inValue) {
			if (enyo.platform.ios && enyo.platform.ios >= 6) {
				var status = inValue.cacheCtrl && (inValue.cacheCtrl.indexOf('no-cache') === 0);
				if (!status) {
					enyo.log("Bad Cache-Control: " + inValue.cacheCtrl + " expected: " + "no-cache");
				}
				return status;
			} else {
				return true;
			}
		});
	},
	testCacheControlOff: function() {
		// skip test on non-iOS platforms, since Firefox always sends cache-control header causing
		// false positive
		if (!enyo.platform.ios) {
			this.finish();
			return;
		}
		this._testAjax({url: "php/test4.php", method: "POST", postBody: "data", headers: {'cache-control': null} }, null, function(inValue) {
			var status = (inValue.cacheCtrl === null);
			if (!status) {
				enyo.log("Bad Cache-Control: " + inValue.cacheCtrl + " expected: " + undefined);
			}
			return status;
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
	testContentTypeFormDataField: function() {
		var formData = new enyo.FormData();
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
	},
	testContentTypeFormDataFile: function() {
		var formData = new enyo.FormData();
		var file = new enyo.Blob(["Some Random File Content!", "And some more..."], {
			name: "myFile"
		});
		formData.append('file', file);
		var contentType = "multipart/form-data";
		this._testAjax({url: "php/test4.php", method: "POST", postBody: formData}, null, function(inValue) {
			var status = (inValue.ctype.indexOf(contentType) === 0) &&
					(inValue.ctype.indexOf("boundary=--") > 10);
			if (!status) {
				enyo.log("Bad CT: " + inValue.ctype + " expected: " + contentType);
			}
			return status;
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
				// extra timeout is to make sure that timeout fail code cancels XHR
				enyo.job("timeouttest", this.bindSafely(function() {this.finish("");}), 4000);
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
	},
	testProgress: function() {
		var progress = 0;
		new enyo.Ajax({url: "php/test7.php"})
			.progress(this, function(inSender, inEvent){
				if (inEvent.max === 10) {
					if (progress === 5 && inEvent.current === 10) {
						this.finish();
					}
				}
				progress = inEvent.current;
			})
			.go();
	}
});
