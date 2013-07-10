(function() {
	// all of the internal kinds are defaulting to enyo.Control.
	// we originally wrote the test for enyo.Component, but that
	// doesn't support the child tree needed to find items.

	var K1 = enyo.kind({
		mixins: ["enyo.AutoBindingSupport"],
		foo: 0,
		components: [
			{
				name: "bar",
				value: 0,
				bindFrom: ".foo",
				bindTo: "value",
				bindTransform: "add42"
			}
		],
		add42: function(inValue) {
			return inValue + 42;
		}
	});

	var K2 = enyo.kind({
		mixins: ["enyo.AutoBindingSupport"],
		foo: 0,
		components: [
			{
				name: "bar",
				value: 0,
				bindFrom: ".foo",
				bindTo: "value",
				bindTransform: "add42"
			},
			{
				name: "baz",
				kind: K1,
				foo: 15
			}
		],
		add42: function(inValue) {
			return inValue + 42;
		}
	});

	// static object that can be bound
	var s1 = new enyo.Object({
		foo: 15,
		bar: 72,
		baz: 42
	});

	var K3 = enyo.kind({
		components: [{
			name: "top",
			components: [{
				name: "middle",
				mixins: ["enyo.AutoBindingSupport"],
				bindSource: s1,
				components: [{
					name: "m1",
					value: 0,
					bindFrom: ".foo",
					bindTo: "value"
				}, {
					name: "m2",
					value: 0,
					bindFrom: "bar",
					bindTo: "value",
					bindTransform: "add42"
				}]
			}]
		}, {
			name: "bottom"
		}],
		add42: function(inValue) {
			return inValue + 42;
		}
	});

	enyo.kind({
		name: "AutoBindingTest",
		kind: enyo.TestSuite,
		noDefer: true,
		testAutoBinding: function () {
			var k1 = new K1();
			if (k1.$.bar.get("value") !== (0 + 42)) {
				throw("default autobinding failed");
			}
			k1.set("foo", 23);
			if (k1.$.bar.get("value") !== (23 + 42)) {
				throw("synced autobinding failed");
			}
			k1.destroy();
			this.finish();
		},
		testNestedAutoBinding: function() {
			var k2 = new K2();
			if (k2.$.bar.get("value") !== (42)) {
				throw("default autobinding failed");
			}
			k2.set("foo", 23);
			if (k2.$.bar.get("value") !== (23 + 42)) {
				throw("synced autobinding failed");
			}
			// set property in second level and make sure binding runs
			if (k2.$.baz.$.bar.get("value") !== (15 + 42)) {
				throw("nested default autobinding failed");
			}
			k2.$.baz.set("foo", 37);
			if (k2.$.baz.$.bar.get("value") !== (37 + 42)) {
				throw("nested synced autobinding failed");
			}
			k2.destroy();
			this.finish();
		},
		testInternalAutoBinding: function() {
			var k3 = new K3();
			if (k3.$.m1.get("value") !== 15) {
				throw("internal default autobinding failed");
			}
			s1.set("foo", 77);
			if (k3.$.m1.get("value") !== 77) {
				throw("internal synced autobinding failed");
			}
			k3.destroy();
			this.finish();
		}
	});
})();