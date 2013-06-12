enyo.kind({
	name: "JobTest",
	kind: enyo.TestSuite,
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
	},
	testJobs: function() {
		var finish = this.bindSafely("finish");
		var number = 0;
		function increment() {
			number++;
		}
		enyo.jobs.add(increment);
		if (number !== 1) {
			finish("High priority did not execute");
		}
	
		enyo.jobs.registerPriority(5, "testPriority");
		enyo.jobs.add(7, increment);

		setTimeout(function(){
			enyo.jobs.unregisterPriority("testPriority");
			if (number !== 2) {
				finish("Low priority did not execute");
			} else {
				finish();
			}
		}, 20);
	}
});
