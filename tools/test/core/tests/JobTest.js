enyo.kind({
	name: "JobTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testStartJob: function() {
		var finish = this.bindSafely("finish");
		enyo.job("testStartJob", function() {
			finish();
		}, 10);
	},
	testStopJob: function() {
		var finish = this.bindSafely("finish");
		enyo.job("testStopJob", function() {
			finish("job wasn't stopped");
		}, 10);
		enyo.job.stop("testStopJob");
		setTimeout(function() {
			finish();
		}, 30);
	},
	testThrottleJob: function() {
		var finish = this.bindSafely("finish");
		var number = 0;
		var increment = function() {
			number++;
		};
		enyo.job.throttle("testThrottleJob", increment, 20);
		setTimeout(function () {
			enyo.job.throttle("testThrottleJob", increment, 20);
		}, 5);
		setTimeout(function () {
			enyo.job.throttle("testThrottleJob", increment, 20);
		}, 15);
		setTimeout(function () {
			enyo.job.throttle("testThrottleJob", increment, 20);
		}, 25);
		setTimeout(function() {
			if (number === 2) {
				finish();
			} else {
				finish("too many or too few calls");
			}
		}, 30);
	}
});