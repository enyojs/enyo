enyo.kind({
	name: "ObserverTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testPublishedPropertyAsObserver: function () {
		var test = {}, o;
		test.Object = enyo.kind({
			kind: enyo.Object,
			published: {
				testProp: false
			},
			testPropChanged: function () {}
		});
		o = new test.Object();
		this.finish(
			(!o.observers.testPropChanged && "the testPropChanged method should have been an observer") ||
			(enyo.indexOf("testProp", o.observers.testPropChanged) !== 0 && "observer dependency should have been testProp") ||
			(!o.observerMap.testProp && "observer map did not include dependency map of testProp") ||
			(enyo.trim(o.observerMap.testProp) !== "testPropChanged" && "observer map should map testProp to testPropChanged handler")
		);
	},
	testFindChangedHandlers: function () {
		var test = {}, o;
		test.Object = enyo.kind({
			kind: enyo.Object,
			testPropChanged: function () {},
			testProp1Changed: function () {}
		});
		o = new test.Object();
		this.finish(
			(!o.observerMap.testProp && "testProp was not automatically added as an observer") ||
			(!o.observerMap.testProp1 && "testProp1 was not automatically added as an observer")
		);
	},
	testAddObserverAPI: function () {
		var test = {}, o, s = this, fn = function (p,c,prop) {
			s.finish(
				(!prop && "the property parameter wasn't present") ||
				(prop !== "testProp" && "the property parameter wasn't correct") ||
				(p !== 0 && "previous value not correct") ||
				(c !== 1 && "current value not correct")
			);
		};
		test.Object = enyo.kind({
			kind: enyo.Object,
			published: {
				testProp: 0
			}
		});
		o = new test.Object();
		o.addObserver("testProp", fn);
		if (!o.observerMap.testProp) {
			return this.finish("observer map not updated on addObserver as expected");
		}
		o.set("testProp", 1);
	},
	testRemoveObserverAPI: function () {
		var o = new enyo.Object(), fn = function () {};
		o.addObserver("noName", fn);
		if (!o.observerMap.noName) {
			return this.finish("remove observer API cannot work because add observer API doesn't work");
		}
		o.removeObserver("noName", fn);
		if (o.observerMap.noName) {
			return this.finish("failed to remove the entry for the observer as expected");
		}
		this.finish();
	},
	testNotificationQueue: function () {
		var test = {}, s = this, o, allowed = false;
		test.Object = enyo.kind({
			kind: enyo.Object,
			published: {
				testProp: 0
			},
			testPropChanged: function (p,c,prop) {
				if (!allowed) {
					throw "observer fired even when notifications were turned off";
				} else {
					s.finish(
						(p !== 1 && "even though the property was queued it did not update the parameters") ||
						(c !== 2 && "even though the property was queued it did not update the parameters")
					);
				}
			}
		});
		o = new test.Object();
		o.stopNotifications();
		if (o.observerNotificationsEnabled) {
			return this.finish("the notifications flag was still enabled");
		}
		if (o.observerStopCount !== 1) {
			return this.finish("the stop count was not updated as expected");
		}
		o.set("testProp", 1);
		// when enabled again the queue should flush only one updated for the observer
		// and its values should have been updated
		o.set("testProp", 2);
		allowed = true;
		o.startNotifications();
	},
	testInheritedKindObservers: function () {
		var test = {},
			rs = "",
			ex = "This message should be short and it should be stupid, but all's well that ends well, right?";
		test.Object1 = enyo.kind({
			kind: enyo.Object,
			observers: {observer1: ["myProp1"]},
			observer1: function () {
				rs += "This message " + this.myProp1 + " short and it ";
			}
		});
		test.Object2 = enyo.kind({
			kind: test.Object1,
			observers: {
				observer3: ["myProp1"],
				observer2: ["myProp2"]
			},
			observer1: function () {
				this.inherited(arguments);
				rs += this.myProp1 + " stupid, but";
			},
			observer2: function () {
				rs += " that " + this.myProp2 + ", right?";
			},
			observer3: function () {
				rs += " all's well";
			}
		});
		test.i = new test.Object2();
		test.i.set("myProp1", "should be");
		test.i.set("myProp2", "ends well");
		this.finish(rs != ex && "the sentences did not match, `" +rs+ "` should have read `" + ex + "`");
	}
});

enyo.kind({
	name: "ComputedTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testWithComputedProperties: function () {
		var test = {}, o, s = this, allowed = false;
		test.Object = enyo.kind({
			kind: enyo.Object,
			published: {
				testProp: 1
			},
			computed: {
				testProp1: ["testProp"],
				testProp2: ["testProp1", "testProp"]
			},
			testProp1: function () {
				return 1 + this.get("testProp");
			},
			testProp2: function () {
				return this.get("testProp") + this.get("testProp1");
			},
			testProp2Changed: function (p,c,prop) {
				if (!allowed) {
					throw "observer fired but notifications were disabled";
				}
				s.finish(c !== 7 && "computed value was not correct, expected 7, got " + c);
			}
		});
		o = new test.Object();
		o.stopNotifications();
		o.set("testProp", 2);
		o.set("testProp", 3);
		allowed = true;
		o.startNotifications();
	},
	testComputedWithBindings: function () {
		var test = {}, o, t, s = this;
		test.Object = enyo.kind({
			kind: enyo.Object,
			published: {
				first: "",
				last: ""
			},
			computed: {
				fullName: ["first", "last"]
			},
			fullName: function () {
				return this.get("first") + " " + this.get("last");
			}
		});
		o = new test.Object({first: "Polly", last: "Shore"});
		t = new enyo.Object({
			fullNameChanged: function () {
				s.finish(
					(this.fullName != "Polly Shore" && "name changed but was not correct")
				);
			}
		});
		o.binding({from: ".fullName", to: ".fullName", target: t});
	},
	testInheritedKindComputed: function () {
		var test = {},
			rs = "",
			ex = "This message should be short and it should be stupid, but all's well that ends well, right?";
		test.Object1 = enyo.kind({
			kind: enyo.Object,
			computed: {observer1: ["myProp1"]},
			observer1: function () {
				return "This message " + this.myProp1 + " short and it ";
			}
		});
		test.Object2 = enyo.kind({
			kind: test.Object1,
			computed: {
				observer2: ["myProp2"]
			},
			observer1: function () {
				var r = this.inherited(arguments);
				return (r += this.myProp1 + " stupid, but all's well");
			},
			observer2: function () {
				return " that " + this.myProp2 + ", right?";
			}
		});
		test.i = new test.Object2();
		test.i.set("myProp1", "should be");
		test.i.set("myProp2", "ends well");
		rs = test.i.get("observer1") + test.i.get("observer2");
		this.finish(rs != ex && "the sentences did not match, `" +rs+ "` should have read `" + ex + "`");
	},
	testDuplicateEntries: function () {
		/*global test:true */
		enyo.kind({
			name: "test.OCSTBase",
			noDefer: true,
			defaultProp1Changed: function () {},
			observers: {
				prop1Changed: ["prop1.1", "prop1.2", "prop1.3"]
			},
			computed: {
				prop1Computed: ["prop1.1", "prop1.2", {cached: true}]
			}
		});
		enyo.kind({
			name: "test.OCSTKind",
			kind: "test.OCSTBase",
			noDefer: true,
			defaultPropChanged: function () {},
			observers: {
				prop1Changed: ["prop1.1", "prop1.2"],
				defaultPropChanged: ["aDifferentProp"]
			},
			computed: {
				prop1Computed: ["prop1.1", "prop1.3"]
			}
		});
		var k = test.OCSTKind.prototype;
		var i;
		if (!~(i=enyo.indexOf("defaultProp", k.observers.defaultPropChanged)) || (i!==enyo.lastIndexOf("defaultProp", k.observers.defaultPropChanged))) {
			return this.finish("no entry or duplicate entry of observer property from implicit + explicit");
		}
		if (!~(i=enyo.indexOf("prop1.1", k.observers.prop1Changed)) || (i!==enyo.lastIndexOf("prop1.1", k.observers.prop1Changed))) {
			return this.finish("no entry or dupcliate entry of observer for compound observer via inheritance");
		}
		if (k.observers.prop1Changed != "prop1.1 prop1.2 prop1.3") {
			return this.finish("the observer entry was either the wrong format or missing properties");
		}
		if (!~(i=enyo.indexOf("prop1.1", k.computed.prop1Computed)) || (i!==enyo.lastIndexOf("prop1.1", k.computed.prop1Computed))) {
			return this.finish("no entry or duplicate entry of computed property from inherited kind");
		}
		if (k.computed.prop1Computed != "prop1.1 prop1.2 prop1.3") {
			return this.finish("the computed entry was either the wrong format or missing properties");
		}
		this.finish();
	}
});
