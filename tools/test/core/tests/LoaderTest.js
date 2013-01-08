enyo.kind({
	name: "LoaderTest",
	kind: enyo.TestSuite,
	testSingleLoad: function() {
		enyo.load("tests/loader1.js", enyo.bind(this,
			function() {
				if (window.LOADER_TEST === "loader1") {
					this.finish();
				}
				else {
					this.finish("callback called before load complete");
				}
			}
		));
	},
	testMultipleLoad: function() {
		enyo.load(["tests/loader2a.js", "tests/loader2b.js"],
			enyo.bind(this, function() {
				if (window.LOADER_TEST === "loader2b") {
					this.finish();
				}
				else {
					this.finish("callback called before load complete");
				}
			}
		));
	},
	testMultipleLoadWith404: function() {
		enyo.load(["tests/loader2b.js", "tests/loader2a.js", "tests/anotherfilethatdoesnotexist.js"],
			enyo.bind(this, function(block) {
				if (window.LOADER_TEST === "loader2a" && block.failed.length === 1 && block.failed[0] === 2) {
					this.finish();
				}
				else {
					this.finish("callback called before load complete");
				}
			}
		));
	}
});