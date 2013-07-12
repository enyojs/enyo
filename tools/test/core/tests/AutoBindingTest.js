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
					bindFrom: ".bar",
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
				this.finish("default autobinding failed");
				return;
			}
			k1.set("foo", 23);
			if (k1.$.bar.get("value") !== (23 + 42)) {
				this.finish("synced autobinding failed");
				return;
			}
			k1.destroy();
			this.finish();
		},
		testNestedAutoBinding: function() {
			var k2 = new K2();
			if (k2.$.bar.get("value") !== (42)) {
				this.finish("default autobinding failed");
				return;
			}
			k2.set("foo", 23);
			if (k2.$.bar.get("value") !== (23 + 42)) {
				this.finish("synced autobinding failed");
				return;
			}
			// set property in second level and make sure binding runs
			if (k2.$.baz.$.bar.get("value") !== (15 + 42)) {
				this.finish("nested default autobinding failed");
				return;
			}
			k2.$.baz.set("foo", 37);
			if (k2.$.baz.$.bar.get("value") !== (37 + 42)) {
				this.finish("nested synced autobinding failed");
				return;
			}
			k2.destroy();
			this.finish();
		},
		testInteriorAutoBinding: function() {
			var k3 = new K3();
			var val;
			val = k3.$.m1.get("value");
			if (val !== 15) {
				this.finish("interior default autobinding failed");
				return;
			}
			s1.set("foo", 77);
			val = k3.$.m1.get("value");
			if (val !== 77) {
				this.finish("interior synced autobinding failed");
				return;
			}
			val = k3.$.m2.get("value");
			if (val !== (42 + 72)) {
				this.finish("interior default transformed autobinding failed");
				return;
			}
			s1.set("bar", 19);
			val = k3.$.m2.get("value");
			if (val !== (42 + 19)) {
				this.finish("interior default transformed autobinding failed");
				return;
			}
			k3.destroy();
			this.finish();
		}
	});
})();