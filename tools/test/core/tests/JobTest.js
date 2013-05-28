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
	testDeferedJob: function() {
		var finish = this.bindSafely("finish");
		var number = 0;
		var increment = function() {
			number++;
		};
		enyo.job.defer(increment); // number should be 1
		if (number !== 1) {
			finish("defered job did not execute even though no animation is in progress");
		}
		// push bogus animation
		enyo.animations.push("bogus_animation");
		enyo.job.defer(increment); // number should still be 1
		if (number !== 1) {
			finish("defered job did execute even though an animation is in progress");
		}
		enyo.job.defer(increment); // number should still be 1
		enyo.job.defer(increment); // number should still be 1
		enyo.animations = [];
		setTimeout(function(){
			if (number !== 2) {
				finish("one defered job should have been picked up");
			}
		}, 100);
		setTimeout(function(){
			if (number === 4) {
				finish();
			} else {
				finish("not all defered jobs have been executed!");
			}
		}, 600);

	}
});
