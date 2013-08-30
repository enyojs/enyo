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
	name: "CollectionTests",
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

enyo.kind({
	name: "StoreTests",
	kind: enyo.TestSuite,
	noDefer: true,
	testExists: function () {
		this.finish(!enyo.store && "enyo.store did not exist as expected");
	},
	testCreateRecord: function () {
		var m = enyo.store.createRecord({id: 70, name: "John"}, {propsWorks: true});
		this.finish(
			(!m && "did not create the record") ||
			(m.get("id") != 70 && "did not get the attributes as expected") ||
			(!m.propsWorks && "did not get the properties as expected")
		);
	},
	testFindLocal: function () {
		var m1   = enyo.store.findLocal({id: 70}),
			m2   = enyo.store.findLocal(enyo.Model, {name: "John"})[0],
			euid = m1 && m1.euid,
			m3   = enyo.store.findLocal(enyo.Model, {euid: euid});
		this.finish(
			(!m1 && "could not find the record by id") ||
			(!m2 && "could not find the record by attribute") ||
			(!m3 && "could not find the record by euid")
		);
	},
	testFindByEuid: function () {
		var m    = enyo.store.findLocal({id: 70}),
			euid = m.euid,
			r    = enyo.store.getRecord(euid);
		this.finish(r != m && "could not retrieve the record by its euid");
	},
	testCreateCollection: function () {
		var c = enyo.store.createCollection([{id:71},{id:72}],{name: "MyCollection"});
		this.finish(
			(!c && "could not create the collection") ||
			(c.name != "MyCollection" && "properties not applied as expected") ||
			(c.length != 2 && "collection did not apply records as expected")
		);
	}
})