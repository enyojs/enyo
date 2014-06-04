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
	testAsyncMethod: function() {
		var timesCalled = 0;
		var self = this;
		enyo.asyncMethod(function() { timesCalled++; });
		enyo.asyncMethod(this, function(i) { timesCalled += 1; }, 1);
		setTimeout(function() {
			if (timesCalled != 2) {
				self.finish("one or more asyncMethods not called");
			} else {
				self.finish();
			}
		}, 25);
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
	}
});
