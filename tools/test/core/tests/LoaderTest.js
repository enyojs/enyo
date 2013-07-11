// LoaderTest will fail on IE8 -- we don't support file loading
// on that platform due to limits on the number of script and
// CSS files that you can pull into a single webpage.
if (!enyo.platform.ie || enyo.platform.ie >= 9) {
	enyo.kind({
		name: "LoaderTest",
		kind: enyo.TestSuite,
		noDefer: true,
		testSingleLoad: function() {
			enyo.load("tests/loader/loader1.js",
				this.bindSafely(function() {
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
			enyo.load(["tests/loader/loader2a.js", "tests/loader/loader2b.js"],
				this.bindSafely(function() {
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
			enyo.load(["tests/loader/loader2b.js", "tests/loader/loader2a.js", "tests/loader/anotherfilethatdoesnotexist.js"],
				this.bindSafely(function(block) {
					if (window.LOADER_TEST === "loader2a" && block.failed.length === 1 && block.failed[0] === "./tests/loader/anotherfilethatdoesnotexist.js") {
						this.finish();
					}
					else {
						this.finish("callback called before load complete");
					}
				}
			));
		},
		testPackageLoad: function() {
			// added a new folder (loader) with a package.js looking for a file setting window.PACKAGE_TEST and a file that doesn't exist
			enyo.load(["tests/loader"],
				this.bindSafely(function(block) {
					if (window.PACKAGE_TEST === "loaded" && block.failed.length === 1 && block.failed[0] === "./tests/loader/nothere.js") {
						this.finish();
					}
					else {
						this.finish("callback called before load complete");
					}
				}
			));
		}
	});
}