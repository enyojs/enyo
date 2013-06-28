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
	}
});