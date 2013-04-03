enyo.kind({
	name: "ComponentTest",
	kind: enyo.TestSuite,
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
	}
});