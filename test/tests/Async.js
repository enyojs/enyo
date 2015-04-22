var Async = require('../../lib/Async');

describe('Async', function () {

	describe('usage', function () {

//	testAsyncExists: function() {
//		new enyo.Async();
//		this.finish();
//	},

		describe('Async exists', function () {

			before(function () {
			});

			after(function () {
			});

			it('should exist', function () {

				expect(Async).to.exist;

			});
		});

//	testAsyncFail: function() {
//		var a = new enyo.Async();
//		a.response(this, function(inSender, inValue) {
//			this.finish("error response not passed to success handler");
//		});
//		a.error(this, function() {
//			this.finish();
//		});
//		a.fail("foo");
//	},

		describe('Async fail', function () {

			var a = new Async();

			before(function () {
			});

			after(function () {
			});

			it('should fail', function (done) {

				a.response(this, function (inSender, inValue) {
					done(new Error('Error response should not be passed to success handler'));
				});

				a.error(this, function () {
					done();
				});

				a.fail("foo");

			});

		});

//	testAsyncInnerFail: function() {
//		new enyo.Async()
//				.response(function(inSender, inValue) {
//					inSender.fail("always fail");
//				})
//				.error(this, function() {
//					this.finish();
//				})
//				.respond("foo")
//		;
//	},

		describe('Async inner fail', function () {

			var a = new Async();

			before(function () {
			});

			after(function () {
			});

			it('should fail', function (done) {
				a.response(this, function (inSender, inValue) {
					inSender.fail("always fail");
				});

				a.error(this, function () {
					done();
				});

				a.fail("foo");
			});

		});

//	testAsyncInnerFailRecover: function() {
//		new enyo.Async()
//				.response(function(inSender, inValue) {
//					inSender.fail("first response always fails");
//				})
//				.error(function(inSender) {
//					inSender.recover();
//					return "recovery response";
//				})
//				.response(this, function(inSender, inValue) {
//					this.finish(inValue == "recovery response" ? null : "fail");
//				})
//				.respond("foo")
//		;
//	}

		describe('Async inner fail recover', function () {

			var fail = false;
			var a = new Async();

			before(function () {
			});

			after(function () {
			});

			it('should recover', function (done) {

				a.response(this, function (inSender, inValue) {
					inSender.fail("first response always fails");
				})

				.error(function(inSender) {
					inSender.recover();
					return "recovery response";
				})

				.response(this, function(inSender, inValue) {
					expect(inValue).to.equal("recovery response");
					done();
				})

				.respond("foo");

			});


		});

	});
});
