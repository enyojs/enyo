enyo.kind({
	name: "BindingTest",
	kind: enyo.TestSuite,
	testCreate: function () {
		new enyo.Binding();
		this.finish();
	},
	testDestroy: function () {
		var binding = new enyo.Binding();
		binding.destroy();
		if (binding.destroyed) {
			this.finish();
		}
		else {
			this.finish("Expected binding to be destroyed, it was not");
		}
	},
	finishWithError: function (val1, val2) {
		var msg = "Expected values to be equal but instead they were: %. != %.";
		this.finish(enyo.format(msg, val1, val2));
	},
	testOneWaySynchronization: function () {
		var control1 = new enyo.Object();
		var control2 = new enyo.Object();
		var binding;
		var val1;
		var val2;
		try {
			control1.set("testprop", "testvalue1");
			control2.set("testprop", "testvalue2");
			binding = new enyo.Binding({
				from: ".testprop",
				source: control1,
				to: ".testprop",
				target: control2
			});
			binding.sync();
			val1 = control1.get("testprop");
			val2 = control2.get("testprop");
			if (val1 !== val2) {
				this.finishWithError(val1, val2);
			}
			else {
				this.finish();
			}
		} finally {
			control1.destroy();
			control2.destroy();
		}
	},
	testTwoWaySynchronization: function () {
		var control1 = new enyo.Object();
		var control2 = new enyo.Object();
		var binding;
		var val1;
		var val2;
		try {
			control1.set("testprop", "testvalue1");
			control2.set("testprop", "testvalue2");
			binding = new enyo.Binding({
				from: ".testprop",
				source: control1,
				to: ".testprop",
				target: control2,
				oneWay: false
			});
			val1 = control1.get("testprop");
			val2 = control2.get("testprop");
			if (val1 !== val2) {
				this.finishWithError(val1, val2);
			}
			control2.set("testprop", "testvalue3");
			val1 = control1.get("testprop");
			val2 = control2.get("testprop");
			if (val1 !== val2) {
				this.finishWithError(val1, val2);
			}
			this.finish();
		} finally {
			control1.destroy();
			control2.destroy();
		}
	},
	testFindGlobal: function () {
		var binding;
		try {
			binding = new enyo.Binding();
			/* global my:true */
			my = {};
			enyo.singleton({
				name: "my.object",
				kind: "enyo.Object",
				testprop: "testvalue1"
			});
			binding.from = "my.object.testprop";
			binding.refresh();
			if (binding.source === my.object) {
				this.finish();
			}
			else {
				this.finish("Expected source to be the global object instead it was: "+binding.source);
			}
		} finally {
			my.object.destroy();
			if (binding) {
				binding.destroy();
			}
		}
	},
	testCleanup: function () {
		var control1;
		var control2;
		var binding;
		try {
			control1 = new enyo.Control();
			control2 = new enyo.Control();
			binding = control1.binding({
				from: ".testprop",
				source: control1,
				to: ".testprop",
				target: control2
			});
			control1.destroy();
			if (!binding.destroyed) {
				throw "Binding was not destroyed when owner end was destroyed";
			}
			control1 = new enyo.Control();
			binding = control1.binding({
				from: ".testprop",
				source: control1,
				to: ".testprop",
				target: control2,
				oneWay: false
			});
			control2.destroy();
			if (!binding.destroyed) {
				throw "When the non-owner end of a two-way binding was destroyed, "+
				"the binding was not destroyed";
			}
			binding = control1.binding({
				from: ".testprop",
				source: control1,
				to: ".testprop",
				target: control2
			});
			if (!binding.destroyed) {
				throw "When the non-owner end of a one-way binding was destroyed "+
				"and a connection attempt was made, it did not detect the end was destroyed and did not "+
				"destroy the binding";
			}
			this.finish();
		} finally {
			control1.destroy();
			control2.destroy();
		}
	},
	testRegistration: function () {
		var binding;
		try {
			binding = new enyo.Binding();
			var id = binding.id;
			if (enyo.Binding.find(id) !== binding) {
				throw "Binding was not registered when created";
			}
			binding.destroy();
			if (enyo.Binding.find(id)) {
				throw "Binding was not unregistered when destroyed";
			}
			this.finish();
		} finally {
			if (binding) {
				binding.destroy();
			}
		}
	},
	testTransform: function () {
		var end;
		var obj;
		try {
			var found = [];
			var expected = ["xform1", "xform2", "inline"];
			end = new enyo.Object();
			var xformtest = function (value, direction, binding, which) {
				if ("testvalue1" !== value) {
					throw which + " had the wrong value, expected testvalue1 got "+value;
				}
				if ("source" !== direction) {
					throw which + " had the wrong direction expected source got "+direction;
				}
				if (end !== binding.source) {
					throw which + " had the wrong source";
				}
				if (!(this instanceof enyo.TestObject)) {
					throw which + " had the wrong context";
				}
				found.push(which);
			};
			/* global xform1:true */
			xform1 = function (value, direction, binding) {
				xformtest.call(this, value, direction, binding, "xform1");
			};
			enyo.kind({
				name: "enyo.TestObject",
				bindings: [
					{from: ".testprop", source: end, to: ".testprop1", transform: "xform1"},
					{from: ".testprop", source: end, to: ".testprop2", transform: "xform2"},
					{from: ".testprop", source: end, to: ".testprop3",
						transform: function (value, direction, binding) {
							xformtest.call(this, value, direction, binding, "inline");
						}}
				],
				xform2: function (value, direction, binding) {
					xformtest.call(this, value, direction, binding, "xform2");
				}
			});
			end.testprop = "testvalue1";
			obj = new enyo.TestObject();
			if (found.length !== expected.length) {
				throw "Not every transform was executed, missing "+
				enyo.union(found, expected).join(", ");
			}
			this.finish();
		} finally {
			end.destroy();
			obj.destroy();
		}
	}
});
