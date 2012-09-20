enyo.kind({
	name: "KindTest",
	kind: enyo.TestSuite,
	testNamespace: function() {
		enyo.kind({name: "custom.Namespace"});
		Boolean(custom.Namespace); // throws an exception if namespace is undefined (Boolean() is just for lint)
		this.finish();
	},
	testNullKind: function() {
		// should succeed as this is allowed
		var K = enyo.kind({kind: null});
		var i = new K({});
		this.finish();
	},
	testUndefinedKind: function() {
		// should throw exception as this is an error
		var pass = false;
		try {
			enyo.kind({kind: undefined});
		} catch(e) {
			pass = true;
		}
		if (!pass) {
			throw("no exception for explicitly undefined kind");
		}
		this.finish();
	},
	testBadStringKind: function() {
		// should throw exception as this is an error
		var pass = false;
		try {
			enyo.kind({kind: "FooBarBaz"});
		} catch(e) {
			pass = true;
		}
		if (!pass) {
			throw("no exception for misnamed kind");
		}
		this.finish();
	}
});