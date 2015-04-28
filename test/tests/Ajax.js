var Ajax = require('../../lib/Ajax');

describe('Ajax', function () {

	describe('usage', function () {

//	testAjax200: function() {
//		new enyo.Ajax({url: "index.html", handleAs: "text"})
//				.response(this, function(inSender, inValue){
//					this.finish();
//				})
//				.error(this, function(inSender, inValue) {
//					this.finish("bad status: " + inValue);
//				})
//				.go();
//	},

		describe('200 OK', function () {

			before(function () {
			});

			after(function () {
			});

			it('should finish normally', function (done) {
				new Ajax({url: "index.html", handleAs: "text"})
						.response(this, function(inSender, inValue){
							done();
						})
						.error(this, function(inSender, inValue) {
							done(new Error("bad status: " + inValue));
						})
						.go();
			});
		});

//	testAjax404: function() {
//		new enyo.Ajax({url: "noexist.not"})
//				.response(this, function(inSender, inValue){
//					this.finish("ajax failed to fail");
//				})
//				.error(this, function(inSender, inValue) {
//					this.finish();
//				})
//				.go();
//	},

		describe('404 Not Found', function () {

			before(function () {
			});

			after(function () {
			});

			it('should finish normally', function (done) {
				new Ajax({url: "noexist.not"})
						.response(this, function(inSender, inValue){
							done(new Error("ajax failed to fail"));
						})
						.error(this, function(inSender, inValue) {
							done();
						})
						.go();
			});
		});

//	testAjaxCustomError: function() {
//		new enyo.Ajax({url: "appinfo.json"})
//				.response(function(inSender, inValue){
//					inSender.fail("cuz I said so");
//				})
//				.error(this, function(inSender, inValue) {
//					this.finish();
//				})
//				.go();
//	},

		describe('AJAX Custom Error', function () {

			before(function () {
			});

			after(function () {
			});

			it('should finish normally', function (done) {
				new Ajax({url: "appinfo.json"})
						.response(function(inSender, inValue){
							inSender.fail("cuz I said so");
						})
						.error(this, function(inSender, inValue) {
							done();
						})
						.go();
			});
		});

//	testAjaxSerial: function() {
//		// if the test finishes before ready, it's a failure
//		var ready = false;
//		//
//		// when 'index' request completes, we are 'ready'
//		var index = new enyo.Ajax({url: "index.html", handleAs: "text"});
//		index.response(function() {
//			ready = true;
//		});
//		//
//		// request triggers 'index' request when it completes
//		new enyo.Ajax({url: "index.html", handleAs: "text"})
//				.response(index)
//				.response(this, function() {
//					// finish clean if 'ready'
//					this.finish(ready ? "" : "requests failed to complete in order");
//				})
//				.go();
//	}

		describe('AJAX Custom Error', function () {

			before(function () {
			});

			after(function () {
			});

			it('should finish normally', function (done) {
				// if the test finishes before ready, it's a failure
				var ready = false;
				//
				// when 'index' request completes, we are 'ready'
				var index = new Ajax({url: "index.html", handleAs: "text"});
				index.response(function() {
					ready = true;
				});
				//
				// request triggers 'index' request when it completes
				new Ajax({url: "index.html", handleAs: "text"})
						.response(index)
						.response(this, function() {
							// finish clean if 'ready'
							expect(ready).to.be.true;
							done();
						})
						.go();
			});
		});

	});
});
