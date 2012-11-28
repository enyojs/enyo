enyo.kind({
	name: "PathResolverTest",
	kind: enyo.TestSuite,
	rewriteTest: function(inResolver, inPath, inExpected) {
		var result = inResolver.rewrite(inPath);
		if (result === inExpected) {
			this.finish();
		} else {
			this.finish("Expected: '" + inExpected + "' Got: '" + result + "'");
		}
	},
	testRewriteUnknown: function() {
		var resolver = new enyo.pathResolverFactory();
		this.rewriteTest(resolver, "$enyo/package.js", "package.js");
	},
	testRewriteEnyo: function() {
		var resolver = new enyo.pathResolverFactory();
		resolver.addPaths({enyo: "my-enyo-dir", lib: "$enyo/../lib"});
		this.rewriteTest(resolver, "$enyo/package.js", "my-enyo-dir/package.js");
	},
	testRewriteOnyx: function() {
		var resolver = new enyo.pathResolverFactory();
		resolver.addPaths({enyo: "my-enyo-dir", lib: "$enyo/../lib"});
		this.rewriteTest(resolver, "$lib/onyx", "my-enyo-dir/../lib/onyx");
	},
	testRewriteEnyoPath: function() {
		var input = "$lib/onyx";
		var result = enyo.path.rewrite(input);
		if (result !== "onyx" && result != input) {
			this.finish();
		} else {
			this.finish("Got: '" + result + "'");
		}
	}
});