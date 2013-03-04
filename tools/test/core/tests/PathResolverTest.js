enyo.kind({
	name: "PathResolverTest",
	kind: enyo.TestSuite,
	rewriteTest: function(inResolver, inPath, inExpected) {
		var pf= enyo.loader.packageFolder;
		enyo.loader.packageFolder = "./source/";

		var result = enyo.loader.getPathPrefix(inPath) + inResolver.rewrite(inPath);

		if (result === inExpected) {
			this.finish();
		} else {
			this.finish("Expected: '" + inExpected + "' Got: '" + result + "'");
		}

		enyo.loader.packageFolder = pf;
	},
	testNormalPath: function() {
		var resolver = new enyo.pathResolverFactory();
		this.rewriteTest(resolver, "my/folder", "./source/my/folder");
	},
	testLeadingSlashPath: function() {
		var resolver = new enyo.pathResolverFactory();
		this.rewriteTest(resolver, "/my/folder", "/my/folder");
	},
	testRewriteHttps: function() {
		var resolver = new enyo.pathResolverFactory();
		this.rewriteTest(resolver, "https://my.server/file.js", "https://my.server/file.js");
	},
	testRewriteHttpMixedCase: function() {
		var resolver = new enyo.pathResolverFactory();
		this.rewriteTest(resolver, "hTtP://my.server/file.js", "hTtP://my.server/file.js");
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