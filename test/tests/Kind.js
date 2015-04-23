var
		kind = require('../../lib/kind'),
		utils = require('../../lib/utils');

var
		MultipleDispatchComponent = require('../../lib/MultipleDispatchComponent');

describe('Kind', function () {

	describe('usage', function () {

//	testNamespace: function() {
//		enyo.kind({name: "custom.Namespace"});
//		/* global custom */
//		Boolean(custom.Namespace); // throws an exception if namespace is undefined (Boolean() is just for lint)
//		this.finish();
//	},

		describe('Namespace', function () {

			var k = kind({name: "custom.Namespace"});

			before(function () {
			});

			after(function () {
			});

			it ('should throw an exception because namespace undefined', function () {

				expect(k).to.throw();

			});

		});

//	testNullKind: function() {
//		// should succeed as this is allowed
//		var K = enyo.kind({kind: null});
//		new K({});
//		this.finish();
//	},

		describe('Null kind', function () {

			before(function () {
			});

			after(function () {
			});

			it ('should allow null kind', function () {

				var k = kind({kind: null});
				expect(k).to.exist;

			});

		});

//	testUndefinedKind: function() {
//		// should throw exception as this is an error
//		var pass = false;
//		try {
//			enyo.kind({kind: undefined});
//		} catch(e) {
//			pass = true;
//		}
//		if (!pass) {
//			throw("no exception for explicitly undefined kind");
//		}
//		this.finish();
//	},

		describe('Undefined kind', function () {

			function undefinedKind () {
				var k = kind({kind: undefined});
			}

			before(function () {
			});

			after(function () {
			});

			it ('should throw an exception because kind is undefined', function () {

				expect(undefinedKind).to.throw();

			});

		});

//  ***** Ignore this test - AJD *****
//	testBadStringKind: function() {
//		// should throw exception as this is an error
//		var pass = false;
//		try {
//			enyo.kind({kind: "FooBarBaz"});
//		} catch(e) {
//			pass = true;
//		}
//		if (!pass) {
//			throw("no exception for misnamed kind");
//		}
//		this.finish();
//	},
//  **********************************

//	testSuperCall: function() {
//		var Base = enyo.kind({
//			pass: function(ctx) {
//				return "base";
//			}
//		});
//		var Derived = enyo.kind({
//			kind: Base,
//			pass: enyo.inherit(function(sup) {
//				return (function(ctx) {
//					if (sup.apply(this, arguments) === "base") {
//						ctx.finish();
//					} else {
//						ctx.finish("super call failed");
//					}
//				});
//			})
//		});
//		var d = new Derived();
//		d.pass(this);
//	},

		describe('Supercall', function () {

			before(function () {
			});

			after(function () {
			});

			it ('should return base arguments', function () {

				var Base = kind({
					pass: function(ctx) {
						return 'base';
					}
				});
				var Derived = kind({
					kind: Base,
					pass: kind.inherit(function(sup) {
						return (function(ctx) {
							expect(sup.apply(this, arguments)).to.equal('base');
						});
					})
				});
				var d = new Derived();
				d.pass(this);

			});

		});

//	testPublished: function() {
//		var K = enyo.kind({
//			published: {
//				a: 42,
//				b: "",
//				c: null
//			},
//			d: 23
//		});
//		var k = new K({a: 16});
//		try {
//			if (!enyo.isFunction(k.setA) || !enyo.isFunction(k.getA) ||
//					!enyo.isFunction(k.setB) || !enyo.isFunction(k.getB) ||
//					!enyo.isFunction(k.setC) || !enyo.isFunction(k.getC)) {
//				throw "no getter or setter defined for published property";
//			}
//			if (k.getA() !== 16) {
//				throw "getA failed";
//			}
//			k.setB("testing");
//			if (k.b !== "testing") {
//				throw "setB failed";
//			}
//			k.set("c", "hello");
//			if (k.getC() !== "hello") {
//				throw "set('c') or getC() failed";
//			}
//		}
//		finally {
//			k.destroy();
//		}
//		this.finish();
//	},

		describe('Test published property', function () {

			var K = kind({
				published: {
					a: 42,
					b: "",
					c: null
				},
				d: 23
			});
			var k = new K({a: 16});

			before(function () {
			});

			after(function () {
			});

			it ('should have getters and setters', function () {

				expect(k.setA).to.be.a('function');
				expect(k.getA).to.be.a('function');
				expect(k.setB).to.be.a('function');
				expect(k.getB).to.be.a('function');
				expect(k.setC).to.be.a('function');
				expect(k.getC).to.be.a('function');

			});

			it ('should get value', function () {

				expect(k.getA()).to.equal(16);

			});

			it ('should set value', function () {

				k.setB('Testing');
				expect(k.b).to.equal('Testing');

			});

			it ('should set and get value', function () {

				k.set('c', 'Hello');
				expect(k.getC()).to.equal('Hello');

			});

		});

//	testInheritedCall: function() {
//		var K = enyo.kind({
//			foo: function(a, b, c) {
//				if (a + b === c) {
//					return true;
//				}
//				return false;
//			}
//		});
//		var K2 = enyo.kind({
//			kind: K,
//			foo: function() {
//				return this.inherited(arguments, [1, 4]);
//			}
//		});
//		var k2 = new K2();
//		if (k2.foo(2, 4, 5)) {
//			this.finish();
//		} else {
//			this.finish("this.inherited didn't allow argument override");
//		}
//	}

		describe('Test inherited call', function () {

			var K = kind({
				foo: function(a, b, c) {
					if (a + b === c) {
						return true;
					}
					return false;
				}
			});
			var K2 = kind({
				kind: K,
				foo: function() {
					return this.inherited(arguments, [1, 4]);
				}
			});
			var k2 = new K2();

			before(function () {
			});

			after(function () {
			});

			it ('should allow argument override', function () {

				expect(k2.foo(2, 4, 5)).to.be.true;

			});

		});

	});

});
