/*global test:true */
enyo.kind({
	name: "ModelTests",
	kind: enyo.TestSuite,
	noDefer: true,
	testCreate: function () {
		var store = enyo.singleton({name: "test.store", kind: enyo.Store});
		new enyo.Model(null, {store: store});
		this.finish();
	},
	testDestroy: function () {
		var m    = test.store.findLocal({kindName: "enyo.Model"})[0],
			euid = m.euid;
		m.destroyLocal();
		this.finish(
			(!m.destroyed && "model was not marked destroyed") ||
			(m.store && "store reference not removed") ||
			(test.store.records.euid[euid] && "store did not remove the record properly") ||
			(test.store.records.kn["enyo.Model"][euid] && "store did not remove the record properly")
		);
	},
	testSetAttribute: function () {
		var m = new enyo.Model({id: 1000}, {store: test.store});
		m.set("prop", true);
		this.finish(m.attributes.prop !== true && "did not properly set the attribute value");
	},
	testGetAttribute: function () {
		var m = test.store.findLocal({kindName: "enyo.Model", id: 1000}),
			v = m.get("prop");
		m.destroyLocal();
		this.finish(v !== true && "did not properly retrieve the attribute value");
	},
	testGetComputedAttribute: function () {
		var m = new enyo.Model({greet: function () {return "Hi.";}}, {store: test.store}),
			v = m.get("greet");
		m.destroyLocal();
		this.finish(v != "Hi." && "did not retrieve the computed attribute properly");
	},
	testObservers: function () {
		var m  = new enyo.Model({id: 70}, {store: test.store}),
			fn, id;
		fn = function (p, v, r) {id=v;};
		m.addObserver("id", fn);
		m.set("id", 71);
		m.destroyLocal();
		this.finish(id != 71 && "observer didn't fire");
	},
	testEvents: function () {
		var m  = new enyo.Model({id: 70}, {store: test.store}),
			fn, id;
		fn = function (r) {id=r.get("id");};
		m.addListener("change", fn);
		m.set("id", 71);
		m.destroyLocal();
		this.finish(id != 71 && "event did not fire as expected");
	},
	testAddListenerContext: function () {
		var c = new enyo.Control(),
			m = new enyo.Model({store: test.store}),
			r = {},
			f = function () { r.contextReference = this.id; };
		// test with context and string
		c.contextString = function () { r.contextString = this.id; };
		m.addListener("testEvent", "contextString", c);
		m.addListener("testEvent", f, c);
		m.triggerEvent("testEvent");
		this.finish(
			(r.contextString != c.id && "string was not resolved to context") ||
			(r.contextReference != c.id && "function reference not bound to context")
		);
	},
	testGetRaw: function () {
		var o = {prop1: "prop1", prop2: true, prop3: "prop3"},
			m = new enyo.Model(o),
			c = function (o1, o2) {
				var r = true;
				for (var k in o1) { if (o2[k] !== o1[k]) { r=false; } }
				return r;
			};
		this.finish(!c(o, m.raw()) && "the raw output was not the same as the original input");
	},
	testPreviousValuesSet: function () {
		var m  = new enyo.Model({
			prop1: function () {
				return this.get("prop2");
			},
			prop2: 0
		}, {computed: {prop1: ["prop2"]}});
		this.finish(
			(m.previous.prop1 !== 0 && "computed property not initialized in previous") ||
			(m.previous.prop2 !== 0 && "somehow initial value is all wrong") ||
			(m.set("prop2", 1) && m.previous.prop1 !== 0 && "previous was updated after change") ||
			(m.previous.prop2 !== 0 && "previous value was updated") ||
			(m.set("prop2", 2) && m.previous.prop1 !== 1 && "previous was not updated correctly") ||
			(m.previous.prop2 !== 1 && "previous value was not updated correctly")
		);
	},
	testPreviousValuesSetObject: function () {
		var m  = new enyo.Model({
			prop1: function () {
				return this.get("prop2");
			},
			prop2: 0
		}, {computed: {prop1: ["prop2"]}});
		this.finish(
			(m.previous.prop1 !== 0 && "computed property not initialized in previous") ||
			(m.previous.prop2 !== 0 && "somehow initial value is all wrong") ||
			(m.set({"prop2": 1}) && m.previous.prop1 !== 0 && "previous was updated after change") ||
			(m.previous.prop2 !== 0 && "previous value was updated") ||
			(m.set({"prop2": 2}) && m.previous.prop1 !== 1 && "previous was not updated correctly") ||
			(m.previous.prop2 !== 1 && "previous value was not updated correctly")
		);
	},
	testDefaultsAttributes: function () {
		/*global test:true */
		enyo.kind({name: "test.Model", kind: enyo.Model, store: test.store, defaults: {prop1: "", prop2: undefined, prop3: null, prop4: 0, prop5: "prop5", prop6: 74}});
		var m = new test.Model({prop5: "newProp5", prop6: 0, prop7: "prop7"}, {store: test.store});
		this.finish(
			(m.attributes.prop1 !== "" && "default empty string missing") ||
			(m.attributes.hasOwnProperty("prop2") && "undefined defaults aren't supposed to be used") ||
			(m.attributes.prop3 !== null && "null was not used from defaults as expected") ||
			(m.attributes.prop4 !== 0 && "'0' default not used from defaults as expected") ||
			(m.attributes.prop5 != "newProp5" && "attribute entry was overridden by default value unexpectedly") ||
			(m.attributes.prop6 !== 0 && "'0' attribute ignored unexectedly") ||
			(m.attributes.prop7 != "prop7" && "new attribute missing")
		);
	},
	testSetObject: function() {
		// test for ENYO-3538
		var m = new enyo.Model({ value1: 0, value2: 0});
		var gotChange = false;
		m.addListener("change", function() {
			gotChange = true;
		});
		m.setObject({ value1: 1, value2: 0});
		if (gotChange) {
			this.finish();
		} else {
			this.finish("didn't fire change event for setObject");
		}
	},
	testFetchedRecordSendsRemoteDestroy: function () {
		var store = enyo.singleton({
				kind: "enyo.Store",
				destroyRecord: enyo.bind(this, function () {
					this.finish();
				}),
				destroyRecordLocal: enyo.bind(this, function () {
					this.finish("destroyed the record as a local record");
				})
			}),
			rec  = new enyo.Model(null, {store: store});
		// simulate a fetch with no data returned which is fine,
		// should flag it as not being new causing a destroy
		// call to use the correct remote-call method in the
		// store
		rec.didFetch();
		rec.destroy();
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
		var c = new enyo.Collection({store: new enyo.Store()});
		c.add([{id:70},{id:71}]);
		this.finish(c.length != 2 && "did not add the records properly");
	},
	testRemoveRecord: function () {
		var c = new enyo.Collection({store: new enyo.Store()});
		for (var i=0; i<30; ++i) { c.add({id: i}); }
		c.remove(c.at(1));
		this.finish(c.length != 29 && "did not remove single record from the collection");
	},
	testRemoveRecords: function () {
		var c = new enyo.Collection({store: new enyo.Store()}), r;
		for (var i=0; i<30; ++i) { c.add({id: i}); }
		for (i=0, r=[]; i<15; ++i) { r.push(c.at(i)); }
		c.remove(r);
		this.finish(c.length != 15 && "did not correctly remove 15 records from the collection");
	},
	testRemoveAll: function () {
		var c = new enyo.Collection({store: new enyo.Store()});
		for (var i=0; i<30; ++i) { c.add({id: i}); }
		c.removeAll();
		this.finish(c.length !== 0 && "did not remove all records from the collection as expected");
	},
	testThatDestroyedRecordIsRemovedFromCollection: function () {
		var c = new enyo.Collection({store: new enyo.Store()});
		c.add({id: 1});
		var r = c.at(0);
		r.destroyLocal();
		this.finish(c.length !== 0 && "record destroyed but was not removed from collection");
	},
	testDestroyAll: function () {
		var s = new enyo.Store(),
			c = new enyo.Collection({store: s}),
			makeRecords = function () {
				var r = [];
				for (var i=0; i<15; ++i) { r.push(s.createRecord({id: i}, {readOnly: true})); }
				return r;
			};
		c.add(makeRecords());
		c.destroyAll();
		c.add(makeRecords());
		c.destroyAll();
		this.finish(
			(c.length !== 0 && "length was not zero as expected after destroyAll was called") ||
			(enyo.keys(s.records.kn["enyo.Model"]).length !== 0 && "records were not removed from the store")
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
		var c  = new enyo.Collection(),
			ev = null,
			fn = function (c, e) { throw e; }, m;
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
	testLengthFiresFirst: function () {
		var c  = new enyo.Collection([{},{}]),
			w  = false,
			fn = function () {if (c.length == 3) { w=true; }};
		c.addListener("add", fn);
		c.add({});
		this.finish(!w && "did not update length prior to receiving the 'add' event");
	},
	testAddRemoveAdd: function () {
		var r = [{id:1},{id:2},{id:3}],
			c = new enyo.Collection({store: new enyo.Store()});
		c.add(r);
		c.removeAll();
		c.add(r);
		this.finish(
			(c.at(0).get("id") !== 1 && "first record failed") ||
			(c.at(1).get("id") !== 2 && "second record failed") ||
			(c.at(2).get("id") !== 3 && "third record failed")
		);
	},
	testDestroy: function () {
		var c = new enyo.Collection([{id:70},{id:71}]);
		c.destroy();
		this.finish(c.length !== 0 && "destroying a collection should remove all of its records");
	},
	testFilterInheritanceProperties: function () {
		/*global test:true */
		enyo.kind({name: "test.CF1", kind: enyo.Collection, filterProps: "prop1 prop2", filters: {filter1: "filter1"}});
		enyo.kind({name: "test.CF2", kind: test.CF1, filterProps: "prop3", filters: {filter2: "filter2"}});
		var c1 = new test.CF1(),
			c2 = new test.CF2();
		test.CF1 = null;
		test.CF2 = null;
		this.finish(
			(c1.filters.filter1 !== "filter1" && "original filter did not exist") ||
			(c1.filters.filter2 && "somehow base kind got subkinds filter") ||
			(c1.filterProps != "prop1 prop2" && "the filterProps property got munged in the base kind") ||
			(c2.filters.filter1 !== "filter1" && "original filter missing on subkind") ||
			(c2.filters.filter2 !== "filter2" && "new filter did not exist on subkind") ||
			(c2.filterProps != "prop1 prop2 prop3" && "subkinds filterProps did not get concatenated as expected") ||
			(c1.filters === c2.filters && "they share the same object")
		);
	},
	testFilters: function () {
		/*global test:true */
		enyo.kind({
			name: "test.CF1",
			kind: enyo.Collection,
			filters: {index: "indexFilter"},
			indexFilter: function () {
				return this.filter(function (r) {
					return 0 === r.get("index") % 2;
				});
			}
		});
		var c, r = [];
		for (var i=0; i<5; ++i) { r.push({index: i}); }
		c = new test.CF1(r);
		test.CF1 = null;
		c.set("activeFilter", "index");
		this.finish(
			(c.length !== 3 && "filter was not applied to content as expected") ||
			(c.filtered !== true && "filtered flag was not set") ||
			(!c._uRecords && "collection did not cache original dataset") ||
			(c.reset() && c.length !== 5 && "calling reset did not restore the collection") ||
			(c.triggerEvent("filter") && c.length !== 3 && "repeating the filter had different result") ||
			(c.clearFilter() && c.length !== 5 && "calling clearFilter did not restore the collection") ||
			(c.filtered !== false && "calling clearFilter did not clear the filtered flag")
		);
	},
	testFilterProps: function () {
		/*global test:true */
		enyo.kind({
			name: "test.CF1",
			kind: enyo.Collection,
			filters: {name: "nameFilter"},
			filterProps: "prop1 prop2",
			activeFilter: "name",
			prop1: "",
			prop2: "",
			nameFilter: function () {
				var p = this.prop1 + this.prop2;
				this.reset();
				return this.filter(function (r) {
					return (p && r.get("name").substring(0, p.length) === p) || (!p && true);
				});
			}
		});
		var c = new test.CF1([{name: "jim"}, {name: "jeff"}, {name: "bob"}, {name: "bill"}, {name: "frank"}]);
		this.finish(
			(c.length !== 5 && "initial length was somehow wrong") ||
			(c.set("prop1", "j") && c.length !== 2 && "single prop change did not filter correctly") ||
			(c.set("prop2", "e") && c.length !== 1 && "setting second prop did not filter correctly") ||
			(c.set("prop1", "b") && c.set("prop2", "") && c.length !== 2 && "resetting properties did not filter correctly") ||
			(c.set("prop1", "") && c.set("prop2", "frank") && c.length !== 1 && "resetting prop1 and explicitly matching prop2 did not filter correctly") ||
			(c.reset() && c.length !== 5 && "resetting did not unfilter even with props set")
		);
	},
	testFetchedRecordSendsRemoteDestroy: function () {
		var store = enyo.singleton({
				kind: "enyo.Store",
				destroyRecord: enyo.bind(this, function () {
					this.finish();
				}),
				destroyRecordLocal: enyo.bind(this, function () {
					this.finish("destroyed the record as a local record");
				})
			}),
			col  = new enyo.Collection({store: store});
		for (var i=0, recs = []; i<10; ++i) {
			recs.push({index: i});
		}
		col.didFetch(null, {success: function () {
			var rec = col.at(0);
			rec.destroy();	
		}, strategy: "add"}, recs);
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
	testFindLocalFailCase: function () {
		// we need to make sure it will gracefully fail when trying to retrieve a record
		// that doesn't exist or no entries have actually been made
		var store = new enyo.Store(),
			mk    = enyo.kind({kind: "enyo.Model"}),
			r1, r2;
		try {
			r1 = store.findLocal(mk, {id: 87});
			r2 = store.findLocal(mk, {euid: enyo.uuid()});
		} catch (e) {
			return this.finish("did not gracefully fail to find record");
		}
		this.finish(
			(r1 !== undefined && "result from findLocal for primaryKey should be undefined") ||
			(r2 !== undefined && "resutl from findLocal for euid should be undefined")
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
});
