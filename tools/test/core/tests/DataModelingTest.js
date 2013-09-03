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
	testRemoveRecord: function () {
		var c = new enyo.Collection();
		for (var i=0; i<30; ++i) { c.add({id: i}); }
		c.remove(c.at(1));
		this.finish(c.length != 29 && "did not remove single record from the collection");
	},
	testRemoveRecords: function () {
		var c = new enyo.Collection();
		for (var i=0; i<30; ++i) { c.add({id: i}); }
		for (i=0, r=[]; i<15; ++i) { r.push(c.at(i)); }
		c.remove(r);
		this.finish(c.length != 15 && "did not correctly remove 15 records from the collection");
	},
	testRemoveAll: function () {
		var c = new enyo.Collection();
		for (var i=0; i<30; ++i) { c.add({id: i}); }
		c.removeAll();
		this.finish(c.length != 0 && "did not remove all records from the collection as expected");
	},
	testThatDestroyedRecordIsRemovedFromCollection: function () {
		var c = new enyo.Collection();
		c.add({id: 1});
		var r = c.at(0);
		r.destroyLocal();
		this.finish(c.length != 0 && "record destroyed but was not removed from collection");
	},
	testDestroyAll: function () {
		var s = new enyo.Store(),
			c = new enyo.Collection({store: s});
		for (var i=0; i<15; ++i) { c.add(s.createRecord({id: i}, {readOnly: true})); }
		c.destroyAll();
		this.finish(
			(c.length != 0 && "length was not zero as expected after destroyAll was called") ||
			(enyo.keys(s.records.kn["enyo.Model"]).length != 0 && "records were not removed from the store")
		);
	},
	testMergeById: function () {
		var c = new enyo.Collection();
		c.add([{id: 0, name: "Jim"}, {id: 1, name: "Jack"}, {id: 2, name: "Jill"}]);
		c.merge([{id: 0, name: "Jimmy"}, {id: 1, name: "Jacky"}, {id: 2, name: "Jillian"}]);
		this.finish(
			(c.at(0).get("name") != "Jimmy" && "first name wasn't changed") ||
			(c.at(1).get("name") != "Jacky" && "second name wasn't changed") ||
			(c.at(2).get("name") != "Jillian" && "third name wasn't changed")
		);
	},
	testMergeByOther: function () {
		var Kind = enyo.kind({kind: enyo.Model, mergeKeys: ["testProp"]}),
			c    = new enyo.Collection({model: Kind});
		for (var i=0; i<3; ++i) { c.add({testProp: i, testValue: i}); }
		c.merge([{testProp: 0, testValue: 1},{testProp: 1, testValue:2},{testProp: 2, testValue: 3}]);
		this.finish(
			(c.at(0).get("testValue") != 1 && "first value wasn't updated") ||
			(c.at(1).get("testValue") != 2 && "second value wasn't updated") ||
			(c.at(2).get("testValue") != 3 && "third value wasn't updated")
		);
	},
	testEvents: function () {
		var c  = new enyo.Collection();
		var ev = null;
		var fn = function (c, e) { throw e; }
		var m;
		for (var i=0, es=["add","remove","destroy"]; (ev=es[i]); ++i) {
			try {
				c.addListener(ev, fn);
				if ("add" == ev) {
					m = enyo.store.createRecord();
					c.add(m);
				} else if ("remove" == ev) {
					c.remove(m);
				} else {
					c.destroy();
				}
			} catch (e) {
				if (e != ev) { break; }
				c.removeListener(ev, fn);
			}
		}
		this.finish(i != 3 && "did not receive all events as expected");
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