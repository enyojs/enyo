enyo.kind({
	name: "readyTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testRunning: function() {
		// this test always succeeds.  If enyo.ready() were borked, this test wouldn't run
		this.finish();
	},
	testAsync: function() {
		var good = false;
		enyo.ready(function () {
			if (good) {
				this.finish();
			} else {
				this.finish("enyo.ready() ran call immediately instead of async");
			}
		}, this);
		good = true;
		// we rely on test framework timeout to catch failure if code is never run
	}
});

// delay start of test suite to verify enyo.ready.require()/provide()
enyo.ready.require("delayedTest");
window.setTimeout(function() {
	enyo.ready.provide("delayedTest");
}, 100);