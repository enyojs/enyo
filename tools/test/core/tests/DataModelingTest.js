enyo.kind({
	name: "ModelTests",
	kind: enyo.TestSuite,
	noDefer: true,
	testCreate: function () {
		var m = new enyo.Model();
		this.finish();
	},
	testDestroy: function () {
		var m    = enyo.store.findLocal({kindName: "enyo.Model"})[0],
			euid = m.euid;
		m.destroyLocal();
		this.finish(
			(!m.destroyed && "model was not marked destroyed") ||
			(m.store && "store reference not removed") ||
			(enyo.store.records.euid[euid] && "store did not remove the record properly") ||
			(enyo.store.records.kn["enyo.Model"][euid] && "store did not remove the record properly")
		);
	},
	testSetAttribute: function () {
		var m = new enyo.Model();
		m.set("prop", true);
		this.finish(m.attributes.prop !== true && "did not properly set the attribute value");
	},
	testGetAttribute: function () {
		var m = enyo.store.findLocal({kindName: "enyo.Model"})[0],
			v = m.get("prop");
		m.destroyLocal();
		this.finish(v !== true && "did not properly retrieve the attribute value");
	},
	testGetComputedAttribute: function () {
		var m = new enyo.Model({greet: function () {return "Hi."}}),
			v = m.get("greet");
		m.destroyLocal();
		this.finish(v != "Hi." && "did not retrieve the computed attribute properly");
	},
	testObservers: function () {
		var m  = new enyo.Model({id: 70}),
			fn, id;
		fn = function (p, v, r) {id=v;};
		m.addObserver("id", fn);
		m.set("id", 71);
		m.destroyLocal();
		this.finish(id != 71 && "observer didn't fire");
	},
	testEvents: function () {
		var m  = new enyo.Model({id: 70}),
			fn, id;
		fn = function (r) {id=r.get("id");};
		m.addListener("change", fn);
		m.set("id", 71);
		m.destroyLocal();
		this.finish(id != 71 && "event did not fire as expected");
	}
});

enyo.kind({
	name: "Collection Tests",
	kind: enyo.TestSuite,
	noDefer: true,
	testCreate: function () {
		new enyo.Collection();
		this.finish();
	},
	testCreateWithRecords: function () {
		var c = new enyo.Collection([{id:70},{id:71}]);
		this.finish(
			(c.length != 2 && "did not initialize length properly") ||
			(c.records.length != 2 && "did not initialize records properly")
		);
	},
	testAddRecords: function () {
		var c = new enyo.Collection();
		c.add([{id:70},{id:71}]);
		this.finish(c.length != 2 && "did not add the records properly");
	},
	testDestroy: function () {
		var c = new enyo.Collection([{id:70},{id:71}]);
		c.destroy();
		this.finish(c.length != 0 && "destroying a collection should remove all of its records");
	}
});