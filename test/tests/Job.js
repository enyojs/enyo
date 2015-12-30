var
	job = require('enyo/job');

describe('Job', function () {

	describe('usage', function () {

		describe('Start job', function () {
			it('should start job', function (done) {
				job('testStartJob', function () {
					done();
				}, 10);
			});
		});

		describe('Stop job', function () {
			it('should stop job', function (done) {
				var ran = false;

				job('testStopJob', function () {
					ran = true;
					done(new Error('Job was not stopped'));
				}, 10);
				job.stop('testStopJob');
				setTimeout(function () {
					if (!ran) done();
				}, 30);
			});
		});

		describe('Throttle job', function () {
			var ran = false;
			var number = 0;
			var increment = function() {
				number++;
			};

			it('should throttle job', function (done) {
				job.throttle('testThrottleJob', increment, 20);
				setTimeout(function () {
					job.throttle('testThrottleJob', increment, 20);
				}, 5);
				setTimeout(function () {
					job.throttle('testThrottleJob', increment, 20);
				}, 15);
				setTimeout(function () {
					job.throttle('testThrottleJob', increment, 20);
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