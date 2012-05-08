enyo.kind({
	name: "KindTest",
	kind: enyo.TestSuite,
	testNamespace: function() {
		enyo.kind({name: "custom.Namespace"});
		Boolean(custom.Namespace); // throws an exception if namespace is undefined (Boolean() is just for lint)
		this.finish();
	}
})