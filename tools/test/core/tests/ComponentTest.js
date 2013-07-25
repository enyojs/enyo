enyo.kind({
	name: "ComponentTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testNestedComponentUndefinedKind: function() {
		var pass = false;
		// should throw exception as this is an error
		try {
			var A = enyo.kind(
				{
					name: "parentComponent",
					components: [
						{
							name: "nestedComponent",
							kind: undefined
						}
					]
				}
			);
			new A({});
		} catch(e) {
			pass = true;
		}
		if (!pass) {
			throw("no exception for explicitly undefined kind in a nested component");
		}
		this.finish();
	},
	testStartJob: function() {
		var finish = this.bindSafely("finish");
		var c = new enyo.Component();
		c.startJob("testStartJob", function() {
			finish();
		}, 10);
	},
	testStartJobStringName: function() {
		var finish = this.bindSafely("finish");
		var c = new enyo.Component({
			pass: function() {
				finish();
			}
		});
		c.startJob("testStartJobStringName", "pass", 10);
	},
	testStopJob: function() {
		var finish = this.bindSafely("finish");
		var c = new enyo.Component();
		c.startJob("testStopJob", function() {
			finish("job wasn't stopped");
		}, 10);
		c.stopJob("testStopJob");
		setTimeout(function() {
			finish();
		}, 30);
	},
	testStopDeferredJob: function() {
		var finish = this.bindSafely("finish");
		var c = new enyo.Component();
		c.startJob("testStopJob", function() {
			finish("job wasn't stopped");
		}, 10);

		enyo.jobs.registerPriority(8, "high");

		setTimeout(function() {
			c.stopJob("testStopJob");
			enyo.jobs.unregisterPriority("high");
			finish();
		}, 20);
	},
	testDestroyJob: function() {
		var finish = this.bindSafely("finish");
		var c = new enyo.Component();
		c.startJob("testDestroyJob", function() {
			finish("job wasn't stopped on destroy");
		}, 10);
		c.destroy();
		setTimeout(function() {
			finish();
		}, 30);
	},
	testThrottleJob: function() {
		var finish = this.bindSafely("finish");
		var c = new enyo.Component({
			number: 0,
			increment: function() {
				this.number++;
			}
		});
		c.throttleJob("testThrottleJob", "increment", 20);
		setTimeout(function () {
			c.throttleJob("testThrottleJob", c.increment, 20);
		}, 5);
		setTimeout(function () {
			c.throttleJob("testThrottleJob", "increment", 20);
		}, 15);
		setTimeout(function () {
			c.throttleJob("testThrottleJob", c.increment, 20);
		}, 25);
		setTimeout(function() {
			if (c.number === 2) {
				finish();
			} else {
				finish("too many or too few calls");
			}
		}, 30);
	},
	testStartJobPriorityNumber: function() {
		var finish = this.bindSafely("finish");
		var c = new enyo.Component({
			number: 0,
			increment: function() {
				this.number++;
			}
		});
		c.startJob("increment", "increment", 1); // number should be 1

		setTimeout(function(){
			if (c.number !== 1) {
				finish("job did not execute even though its not blocked");
			} else {
				finish();
			}
		}, 20);
	},
	testStartJobPriorityNumberBlocked: function() {
		var finish = this.bindSafely("finish");
		var c = new enyo.Component({
			number: 0,
			increment: function() {
				this.number++;
			}
		});
		enyo.jobs.registerPriority(5, "testPriority");
		c.startJob("incrementLow", "increment", 1, 1); // number should be 1
		c.startJob("incrementHigh", "increment", 1, 6); // number should be 2

		setTimeout(function(){
			if (c.number !== 1) {
				finish("High priority did not execute");
			}
			enyo.jobs.unregisterPriority("testPriority");
			if (c.number !== 2) {
				finish("Low priority did not execute");
			} else {
				finish();
			}
		}, 20);
	}
});
