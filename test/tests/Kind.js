var
	kind = require('enyo/kind'),
	utils = require('enyo/utils');

describe('Kind', function () {

	describe('usage', function () {

		describe('Namespace', function () {
			var k;

			before(function () {
				k = kind({name: 'custom.Namespace'});
			});

			after(function () {
				k = null;
			});

			it ('should throw an exception because namespace undefined', function () {
				expect(k).to.throw();
			});
		});

		describe('Null kind', function () {
			var k;

			before(function () {
				 k = kind({kind: null});
			});

			after(function () {
				k = null;
			});

			it ('should allow null kind', function () {
				expect(k).to.exist;
			});
		});

		describe('Undefined kind', function () {
			function undefinedKind () {
				var k = kind({kind: undefined});
			}

			it ('should throw an exception because kind is undefined', function () {
				expect(undefinedKind).to.throw();
			});
		});

		describe('Supercall', function () {
			var d, value;
			before(function () {
				var Base = kind({
					pass: function (ctx) {
						return 'base';
					}
				});
				var Derived = kind({
					kind: Base,
					pass: kind.inherit(function (sup) {
						return function (ctx) {
							return sup.apply(this, arguments);
						};
					})
				});

				d = new Derived();
			});

			after(function () {
				d.destroy();
			});

			it ('should return base arguments', function () {
				value = d.pass(this);
				expect(value).to.equal('base');
			});
		});

		describe('Test published property', function () {
			var k;

			before(function () {
				var K = kind({
					published: {
						a: 42,
						b: '',
						c: null
					},
					d: 23
				});
				k = new K({a: 16});
			});

			after(function () {
				k.destroy();
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

		describe('Test inherited call', function () {
			var k2;

			before(function () {
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
				k2 = new K2();
			});

			after(function () {
				k2.destroy();
			});

			it ('should allow argument override', function () {
				expect(k2.foo(2, 4, 5)).to.be.true;
			});
		});
	});
});