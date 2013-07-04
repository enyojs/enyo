enyo.kind({
	name: "DecodePackagePathTest",
	kind: enyo.TestSuite,
	noDefer: true,
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
		this.decodeTest("", {folder: "", manifest: "package.js"});
	},
	testDecodeFoo: function() {
		this.decodeTest("foo", {folder: "foo/", manifest: "foo/package.js"});
	},
	testDecodeFooSlash: function() {
		this.decodeTest("foo/", {folder: "foo/", manifest: "foo/package.js"});
	},
	testDecodeFooBackSlash: function() {
		this.decodeTest("foo\\", {folder: "foo/", manifest: "foo/package.js"});
	},
	testDecodeFooBarBaz: function() {
		this.decodeTest("foo/bar/baz", {folder: "foo/bar/baz/", manifest: "foo/bar/baz/package.js"});
	},
	testDecodeParentFoo: function() {
		this.decodeTest("../foo", {folder: "../foo/", manifest: "../foo/package.js"});
	},
	testDecodeFooBarLibBaz: function() {
		this.decodeTest("foo/bar/lib/baz", {folder: "foo/bar/lib/baz/", manifest: "foo/bar/lib/baz/package.js"});
	},
	testDecodeEnyoFoo: function() {
		var $enyo = enyo.path.rewrite("$enyo");
		this.decodeTest($enyo + "/foo", {folder: $enyo + "foo/", manifest: $enyo + "foo/package.js"});
	},
	testDecodeAbsEnyoFoo: function() {
		var $enyo = enyo.path.rewrite("$enyo") + "../enyo/";
		this.decodeTest($enyo + "foo", {folder: $enyo + "foo/", manifest: $enyo + "foo/package.js"});
	},
	testDecodeSource: function() {
		this.decodeTest("source", {folder: "source/", manifest: "source/package.js"});
	},
	testDecodeFooBarSource: function() {
		this.decodeTest("foo/bar/source", {folder: "foo/bar/source/", manifest: "foo/bar/source/package.js"});
	},
	testDecodeFooBarSourceZot: function() {
		this.decodeTest("foo/bar/source/zot", {folder: "foo/bar/source/zot/", manifest: "foo/bar/source/zot/package.js"});
	},
	testDecodeSourceFoo: function() {
		this.decodeTest("source/foo", {folder: "source/foo/", manifest: "source/foo/package.js"});
	},
	testLocalPackage: function() {
		this.decodeTest("package.js", {folder: "", manifest: "package.js"});
	},
	testFooPackage: function() {
		this.decodeTest("foo/package.js", {folder: "foo/", manifest: "foo/package.js"});
	},
	testRemote: function() {
		this.decodeTest("http://flarn.com/lib/foo", {folder: "http://flarn.com/lib/foo/"});
	}
});