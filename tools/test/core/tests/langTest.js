enyo.kind({
	name: "langTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testCallee: function() {
		var err = "";
		var fn = function() {
			err = (arguments.callee.displayName !== 'fn');
		};
		fn.displayName = "fn";
		fn();
		this.finish(err);
	},
	testClass: function() {
		enyo.kind({
			name: "AClass"
		});
		/* global AClass */
		new AClass();
		var err = (typeof AClass !== 'function');
		this.finish(err);
	},
	testisString: function() {

		// Create alternate window context to write vars from
		var iframe = document.createElement("iframe"),
		iframeDoc, err;

		document.body.appendChild(iframe);
		iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
		iframeDoc.write("<script>parent.iString = new String('hello');</script>");
		iframeDoc.close();

		if (!enyo.isString("string")) {
			err = "enyo.isString() cannot determine strings correctly";
		}
		// This will fail:
		//  - instanceof from another context
		//  - typeof (b/c it is a string instance)
		// https://github.com/enyojs/enyo/issues/2
		/* global iString */
		if (!enyo.isString(iString)) {
			err = "enyo.isString() cannot determine strings written from other window contexts correctly";
		}

		document.body.removeChild(iframe);
		this.finish(err);
	},
	testindexOfRegular: function() {
		var index = enyo.indexOf("foo", [null, null, null, null,"foo"]);
		this.finish(index !== 4 ? "Incorrect index" : false);
	},
	testindexOfFromIndex: function() {
		var index = enyo.indexOf("foo", [null, null, null, null,"foo"], 10);
		this.finish(index !== -1 ? "if fromIndex is greater then array length, should return -1" : false);
	},
	testIsObject: function() {
		if (!enyo.isObject({})) {
			this.finish("enyo.isObject failed on object");
			return;
		}
		if (enyo.isObject(undefined)) {
			this.finish("enyo.isObject failed on undefined");
			return;
		}
		if (enyo.isObject(null)) {
			this.finish("enyo.isObject failed on null");
			return;
		}
		if (enyo.isObject([1,2,3])) {
			this.finish("enyo.isObject failed on array");
			return;
		}
		if (enyo.isObject(42)) {
			this.finish("enyo.isObject failed on number");
			return;
		}
		if (enyo.isObject("forty-two")) {
			this.finish("enyo.isObject failed on string");
			return;
		}
		this.finish();
	},
	testIsArray: function() {
		if (enyo.isArray({})) {
			this.finish("enyo.isArray failed on object");
			return;
		}
		if (enyo.isArray(undefined)) {
			this.finish("enyo.isArray failed on undefined");
			return;
		}
		if (enyo.isArray(null)) {
			this.finish("enyo.isArray failed on null");
			return;
		}
		if (!enyo.isArray([1,2,3])) {
			this.finish("enyo.isArray failed on array");
			return;
		}
		if (enyo.isArray(42)) {
			this.finish("enyo.isArray failed on number");
			return;
		}
		if (enyo.isArray("forty-two")) {
			this.finish("enyo.isArray failed on string");
			return;
		}
		this.finish();
	},
	// test the various configurations of enyo.mixin
	testMixin: function () {
		var $t = {}, $s = {one:"one",two:"two"};
		// test normal setup
		enyo.mixin($t, $s);
		if (enyo.union(enyo.keys($t),enyo.keys($s)).length) {
			return this.finish("Expected keys to be the same");
		}
		// test with no passed in target
		$t = null;
		$t = enyo.mixin(null, $s);
		if (!$t || enyo.union(enyo.keys($t),enyo.keys($s)).length) {
			if (!$t) {
				return this.finish("Expected new object to be created");
			}
			return this.finish("Expected keys to be the same");
		}
		// test with base and array of sources
		$t = {};
		$s = [{one:"one"},{two:"two"},{one:"three"}];
		enyo.mixin($t, $s);
		if (enyo.keys($t).length != 2) {
			return this.finish("Expected result to have 2 keys");
		}
		if ($t.one != "three") {
			return this.finish("Recursive mixin did not copy properly");
		}
		// test with no base and array of sources
		$t = null;
		$t = enyo.mixin($s);
		if (!$t || enyo.keys($t).length != 2) {
			if (!$t) {
				return this.finish("Target was not created for array sources");
			}
			return this.finish("Recursive mixin did not copy properly for no base and " +
				"array of sources");
		}
		// test for the ignore feature (if this works it should work for simply scenarios)
		$t = {one: "ONE"};
		$s = [{one: "one"}, {two:"two"}, {one:"three"},{three:"three"}];
		enyo.mixin($t, $s, true);
		if ($t.one != "ONE") {
			return this.finish("The ignore flag was not used properly");
		}
		// test for use of options hash
		$t = {one: "ONE"};
		$s = {one: "one", two: "TWO", three: null};
		enyo.mixin($t, $s, {ignore: true, exists: true});
		if ($t.one == "one" || enyo.exists($t.three)) {
			return this.finish("The options hash was not applied correctly -> " + enyo.keys($t).join(","));
		}
		this.finish();
	}
});
