var
	ready = require('enyo/ready');

describe('ready', function () {

	describe('usage', function () {

		describe('Async', function () {
			var good = false;
			it('should call ready() asynchronously', function (done) {
				ready(function () {
					if (good) {
						done();
					} else {
						done(new Error("enyo.ready() ran call immediately instead of async"));
					}
				}, this);
			});
			good = true;
		});

		// we include this a second time to verify that we can keep calling enyo.ready()
		describe('Async2', function () {
			var good = false;
			it('should call ready() asynchronously', function (done) {
				ready(function () {
					if (good) {
						done();
					} else {
						done(new Error("enyo.ready() ran call immediately instead of async"));
					}
				}, this);
			});
			good = true;
		});
	});
});
