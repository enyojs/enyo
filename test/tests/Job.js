var job = require('../../lib/job');

describe('Job', function () {

	describe('usage', function () {

//	testStartJob: function() {
//		var finish = this.bindSafely("finish");
//		enyo.job("testStartJob", function() {
//			finish();
//		}, 10);
//	},

		describe('Start job', function () {

			before(function () {
			});

			after(function () {
			});

			it('should start job', function (done) {
				job("testStartJob", function () {
					done();
				}, 10);
			});
		});

//	testStopJob: function() {
//		var finish = this.bindSafely("finish");
//		enyo.job("testStopJob", function() {
//			finish("job wasn't stopped");
//		}, 10);
//		enyo.job.stop("testStopJob");
//		setTimeout(function() {
//			finish();
//		}, 30);
//	},

			describe('Stop job', function () {

				var ran = false;

				before(function () {
				});

				after(function () {
				});

				it('should stop job', function (done) {
					job("testStopJob", function () {
						ran = true;
						done(new Error('Job was not stopped'));
					}, 10);
					job.stop("testStopJob");
					setTimeout(function () {
						if (!ran) {
							done()
						}
					}, 30);
				});
			});

//	testThrottleJob: function() {
//		var finish = this.bindSafely("finish");
//		var number = 0;
//		var increment = function() {
//			number++;
//		};
//		enyo.job.throttle("testThrottleJob", increment, 20);
//		setTimeout(function () {
//			enyo.job.throttle("testThrottleJob", increment, 20);
//		}, 5);
//		setTimeout(function () {
//			enyo.job.throttle("testThrottleJob", increment, 20);
//		}, 15);
//		setTimeout(function () {
//			enyo.job.throttle("testThrottleJob", increment, 20);
//		}, 25);
//		setTimeout(function() {
//			if (number === 2) {
//				finish();
//			} else {
//				finish("too many or too few calls");
//			}
//		}, 30);
//	}

		describe('Throttle job', function () {

			var ran = false;
			var number = 0;
			var increment = function() {
				number++;
			};

			before(function () {
			});

			after(function () {
			});

			it('should throttle job', function (done) {
				job.throttle("testThrottleJob", increment, 20);
				setTimeout(function () {
					job.throttle("testThrottleJob", increment, 20);
				}, 5);
				setTimeout(function () {
					job.throttle("testThrottleJob", increment, 20);
				}, 15);
				setTimeout(function () {
					job.throttle("testThrottleJob", increment, 20);
				}, 25);
				setTimeout(function() {
					if (number === 2) {
						done();
					} else {
						done(new Error('too many or too few calls'));
					}
				}, 30);
			});
		});

	});
});


