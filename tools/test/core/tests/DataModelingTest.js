enyo.kind({
	name: "ModelTests",
	kind: enyo.TestSuite,
	noDefer: true,
	testCreate: function () {
		var m = new enyo.Model();
		this.finish();
	},
	testDestroy: function () {
		var m = enyo.store.findLocal({kindName: "enyo.Model"})[0];
		m.destroyLocal();
		this.finish();
	},
	
});