enyo.kind({
	name: "KindTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testNamespace: function() {
		enyo.kind({name: "custom.Namespace"});
		/* global custom */
		Boolean(custom.Namespace); // throws an exception if namespace is undefined (Boolean() is just for lint)
		this.finish();
	},
	testNullKind: function() {
		// should succeed as this is allowed
		var K = enyo.kind({kind: null});
		new K({});
		this.finish();
	},
	testUndefinedKind: function() {
		// should throw exception as this is an error
		var pass = false;
		try {
			enyo.kind({kind: undefined});
		} catch(e) {
			pass = true;
		}
		if (!pass) {
			throw("no exception for explicitly undefined kind");
		}
		this.finish();
	},
	testBadStringKind: function() {
		// should throw exception as this is an error
		var pass = false;
		try {
			enyo.kind({kind: "FooBarBaz"});
		} catch(e) {
			pass = true;
		}
		if (!pass) {
			throw("no exception for misnamed kind");
		}
		this.finish();
	},
	testSuperCall: function() {
		var Base = enyo.kind({
			pass: function(ctx) {
				return "base";
			}
		});
		var Derived = enyo.kind({
			kind: Base,
			pass: enyo.inherit(function(sup) {
				return (function(ctx) {
					if (sup.apply(this, arguments) === "base") {
						ctx.finish();
					} else {
						ctx.finish("super call failed");
					}
				});
			})
		});
		var d = new Derived();
		d.pass(this);
	},
	testPublished: function() {
		var K = enyo.kind({
			published: {
				a: 42,
				b: "",
				c: null
			},
			d: 23
		});
		var k = new K({a: 16});
		try {
			if (!enyo.isFunction(k.setA) || !enyo.isFunction(k.getA) ||
				!enyo.isFunction(k.setB) || !enyo.isFunction(k.getB) ||
				!enyo.isFunction(k.setC) || !enyo.isFunction(k.getC)) {
				throw "no getter or setter defined for published property";
			}
			if (k.getA() !== 16) {
				throw "getA failed";
			}
			k.setB("testing");
			if (k.b !== "testing") {
				throw "setB failed";
			}
			k.set("c", "hello");
			if (k.getC() !== "hello") {
				throw "set('c') or getC() failed";
			}
		}
		finally {
			k.destroy();
		}
		this.finish();
	},
	testInheritedCall: function() {
		var K = enyo.kind({
			foo: function(a, b, c) {
				if (a + b === c) {
					return true;
				}
				return false;
			}
		});
		var K2 = enyo.kind({
			kind: K,
			foo: function() {
				return this.inherited(arguments, [1, 4]);
			}
		});
		var k2 = new K2();
		if (k2.foo(2, 4, 5)) {
			this.finish();
		} else {
			this.finish("this.inherited didn't allow argument override");
		}
	}
});