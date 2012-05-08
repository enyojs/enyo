enyo.kind({
	name: "DecodePackagePathTest",
	kind: enyo.TestSuite,
	assert: function(inParts, inPart, inValue) {
		if (inParts[inPart] != inValue) {
			this.finish('bad ' + inPart + ', expected "' + inValue + '" got "' + inParts[inPart] + '"');
			return false;
		}
		return true;
	},
	decodeTest: function(inPath, inExpected) {
		var parts = enyo.loaderFactory.prototype.decodePackagePath(inPath);
		for (var n in inExpected) {
			if (!this.assert(parts, n, inExpected[n])) {
				return;
			}
		}
		this.finish();
	},
	testDecodeEmpty: function() {
		this.decodeTest("", {folder: "", manifest: "package.js", alias: "", target: ""});
	},
	testDecodeFoo: function() {
		this.decodeTest("foo", {folder: "foo/", manifest: "foo/package.js", alias: "foo", target: "foo"});
	},
	testDecodeFooSlash: function() {
		this.decodeTest("foo/", {folder: "foo/", manifest: "foo/package.js", alias: "foo", target: "foo"});
	},
	testDecodeFooBackSlash: function() {
		this.decodeTest("foo\\", {folder: "foo/", manifest: "foo/package.js", alias: "foo", target: "foo"});
	},
	testDecodeFooBarBaz: function() {
		this.decodeTest("foo/bar/baz", {folder: "foo/bar/baz/", manifest: "foo/bar/baz/package.js", alias: "foo-bar-baz", target: "foo/bar/baz"});
	},
	testDecodeParentFoo: function() {
		this.decodeTest("../foo", {folder: "../foo/", manifest: "../foo/package.js", alias: "foo", target: "../foo"});
	},
	testDecodeFooBarLibBaz: function() {
		this.decodeTest("foo/bar/lib/baz", {folder: "foo/bar/lib/baz/", manifest: "foo/bar/lib/baz/package.js", alias: "baz", target: "foo/bar/lib/baz"});
	},
	testDecodeEnyoFoo: function() {
		var $enyo = enyo.path.rewrite("$enyo");
		this.decodeTest($enyo + "/foo", {folder: $enyo + "foo/", manifest: $enyo + "foo/package.js", alias: "foo", target: $enyo + "foo"});
	},
	testDecodeAbsEnyoFoo: function() {
		var $enyo = enyo.path.rewrite("$enyo") + "../enyo/";
		this.decodeTest($enyo + "foo", {folder: $enyo + "foo/", manifest: $enyo + "foo/package.js", alias: "foo", target: $enyo + "foo"});
	},
	testDecodeSource: function() {
		this.decodeTest("source", {folder: "source/", manifest: "source/package.js", alias: "", target: ""});
	},
	testDecodeFooBarSource: function() {
		this.decodeTest("foo/bar/source", {folder: "foo/bar/source/", manifest: "foo/bar/source/package.js", alias: "foo-bar", target: "foo/bar"});
	},
	testDecodeFooBarSourceZot: function() {
		this.decodeTest("foo/bar/source/zot", {folder: "foo/bar/source/zot/", manifest: "foo/bar/source/zot/package.js", alias: "foo-bar-zot", target: "foo/bar/zot"});
	},
	testDecodeSourceFoo: function() {
		this.decodeTest("source/foo", {folder: "source/foo/", manifest: "source/foo/package.js", alias: "foo", target: "foo"});
	},
	testLocalPackage: function() {
		this.decodeTest("package.js", {folder: "", manifest: "package.js", alias: "", target: ""});
	},
	testFooPackage: function() {
		this.decodeTest("foo/package.js", {folder: "foo/", manifest: "foo/package.js", alias: "foo", target: "foo"});
	},
	testRemote: function() {
		this.decodeTest("http://flarn.com/lib/foo", {folder: "http://flarn.com/lib/foo/", manifest: "http://flarn.com/lib/foo/package.js", alias: "foo", target: "http://flarn.com/lib/foo"});
	}
});