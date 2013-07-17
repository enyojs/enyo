enyo.kind({
	name: "readyTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testRunning: function() {
		// this test always succeeds.  If enyo.ready() were borked, this test wouldn't run
		this.finish();
	}
});

// delay start of test suite to verify enyo.ready.require()/provide()
enyo.ready.require("delayedTest");
window.setTimeout(function() {
	enyo.ready.provide("delayedTest");
}, 100);