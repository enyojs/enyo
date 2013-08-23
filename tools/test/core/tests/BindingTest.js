enyo.kind({
	name: "BindingTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testCreate: function () {
		// create an empty binding, if this fails or throws errors then we
		// have a big problem
		new enyo.Binding();
		this.finish();
	},
	testDestroy: function () {
		var o = new enyo.Object(),
			s = new enyo.Object(),
			b = new enyo.Binding({source: o, owner: o, target: s, from: ".name", to: ".name", oneWay: false});
		b.destroy();
		this.finish(
			(!b.destroyed && "did not set the destroy flag") ||
			(b.source && "source wasn't removed") ||
			(b.target && "target wasn't removed") ||
			(b._sourceObserver && "source observer wasn't removed") ||
			(b._targetObserver && "target observer wasn't removed") ||
			(b.transform && "transform still existed") ||
			(b.owner && "owner still existed") ||
			(enyo.Binding.find(b.id) && "id was not removed from the store")
		);
	},
	testOneWaySynchronization: function () {
		var c = enyo.singleton({
			prop: "Shared",
			components: [
				{name: "child"}
			],
			bindings: [
				{from: ".prop", to: ".$.child.content"}
			]
		});
		this.finish(c.$.child.content != "Shared" && "did not set binding to property correctly");
	},
	testTwoWaySynchronization: function () {
		var c = enyo.singleton({
			prop: "Shared",
			components: [
				{name: "child"}
			],
			bindings: [
				{from: ".prop", to: ".$.child.content", oneWay: false}
			]
		});
		c.$.child.set("content", "Correctly");
		this.finish(c.prop != "Correctly" && "did not set two way content back");
	},
	testFindGlobal: function () {
		/* global binding:true */
		binding = {s: new enyo.Object({prop: "Shared"})};
		var c = enyo.singleton({
			components: [
				{name: "child"}
			],
			bindings: [
				{from: "^binding.s.prop", to: ".$.child.content"}
			]
		});
		this.finish(c.$.child.content != "Shared" && "did not find the global source");
	},
	testCleanupOnOwnerDestroy: function () {
		var c = enyo.singleton({
			prop: "Shared",
			components: [
				{name: "child"}
			],
			bindings: [
				{from: ".prop", to: ".$.child.content"}
			]
		}), b;
		b = c.bindings[0];
		c.destroy();
		this.finish(!b.destroyed && "binding was not destroyed when owner was destroyed");
	},
	testCleanupOnDiscoverTargetDestroyed: function () {
		var c = enyo.singleton({
			prop: "Shared",
			components: [
				{name: "child"}
			],
			bindings: [
				{from: ".prop", to: ".$.child.content"}
			]
		}), b;
		b = c.bindings[0];
		c.$.child.destroy();
		b.sync();
		this.finish(!b.destroyed && "binding was not destroyed when it discovered its target was destroyed");
	},
	testRegistration: function () {
		var b1 = new enyo.Binding(),
			b2 = new enyo.Binding(),
			i1 = b1.id,
			i2 = b2.id;
		b2.destroy();
		this.finish(
			(enyo.Binding.find(i1) !== b1 && "did not register the binding correctly") ||
			(enyo.Binding.find(i2) === b2 && "did not unregister the binding when it was destroyed")
		);
	},
	testFindTransformInGlobal: function () {
		var p = 1;
		/* global transform:true */
		transform = function () {
			++p;
		};
		enyo.singleton({
			prop: "Shared",
			components: [
				{name: "child"}
			],
			bindings: [
				{from: ".prop", to: ".$.child.content", transform: "transform"}
			]
		});
		this.finish(p != 2 && "did not find the global transform");
	},
	testFindTransformInline: function () {
		var p = 1;
		enyo.singleton({
			prop: "Shared",
			components: [
				{name: "child"}
			],
			bindings: [
				{from: ".prop", to: ".$.child.content", transform: function () { ++p; }}
			]
		});
		this.finish(p != 2 && "did not find the inline transform");
	},
	testFindTransformInInstanceOwner: function () {
		var p = 1;
		enyo.singleton({
			prop: "Shared",
			components: [
				{name: "child"}
			],
			bindings: [
				{from: ".prop", to: ".$.child.content", transform: "transform"}
			],
			transform: function () { ++p; }
		});
		this.finish(p != 2 && "did not find the transform on the instance owner");
	},
	testFindTransformInNestedKind: function () {
		var p = 1, Ctor = enyo.kind({
			prop: "Shared",
			components: [
				{name: "child"}
			],
			bindings: [
				{from: ".prop", to: ".$.child.content", transform: "transform"}
			],
			transform: function () { ++p; }
		});
		enyo.singleton({
			components: [
				{kind: Ctor}
			]
		});
		this.finish(p != 2 && "did not find the nested kind's transform");
	},
	testFindTransformInNestedKindOnInstanceOwner: function () {
		var p = 1, Ctor = enyo.kind({
			prop: "Shared",
			components: [
				{name: "child"}
			]
		});
		enyo.singleton({
			components: [
				{kind: Ctor, bindings: [
					{from: ".prop", to: ".$.child.content", transform: "transform"}
				]}
			],
			transform: function () { ++p; }
		});
		this.finish(p != 2 && "did not find the nested kind's transform on the instance owner");
	},
	testDefaultProperties: function () {
		var c = enyo.singleton({
			prop: "Shared",
			bindingDefaults: {
				source: ".$.child1"
			},
			components: [
				{name: "child1", prop: "ChildShared"},
				{name: "child2"},
				{name: "child3"}
			],
			bindings: [
				{from: ".prop", to: ".$.child2.content"},
				{from: ".prop", to: ".$.child3.content", source: "."}
			]
		});
		this.finish(
			(c.$.child2.content != "ChildShared" && "defaults were not applied") ||
			(c.$.child3.content != "Shared" && "defaults were used even with explicit property")
		);
	}
});
