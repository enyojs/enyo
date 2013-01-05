enyo.kind({
	name: "langTest",
	kind: enyo.TestSuite,
	testCallee: function() {
		var err = "";
		var fn = function() {
			err = (arguments.callee.nom !== 'fn');
		};
		fn.nom = "fn";
		fn();
		this.finish(err);
	},
	testClass: function() {
		enyo.kind({
			name: "AClass"
		});
		var obj = new AClass();
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
	}
});