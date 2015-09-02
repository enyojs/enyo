var
	utils = require('enyo/utils'),
	kind = require('enyo/kind');

describe('language', function () {

	describe('usage', function () {

		describe('Callee', function () {
			var dn = '';
			var fn = function() {
				dn = arguments.callee.displayName;
			};

			it('should have proper callee', function () {
				fn.displayName = "fn";
				fn();
				expect(dn).to.equal('fn')
			});
		});

		describe('Class', function () {
			var AClass;

			before(function () {
				AClass = kind({
					name: "AClass"
				});
			});

			after(function () {
				AClass = null;
			});

			it('should be a function', function () {
				expect(AClass).to.be.a('function')
			});
		});

		describe('isString', function () {
			var iframe;

			before(function () {
				var iframeDoc;

				// Create alternate window context to write vars from
				iframe = document.createElement("iframe"),
				document.body.appendChild(iframe);
				iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
				iframeDoc.write("<script>parent.iString = new String('hello');</script>");
				iframeDoc.close();
			});

			after(function () {
				document.body.removeChild(iframe);
				iframe = null;
			});

			it('should determine strings properly', function () {
				expect(utils.isString("string")).to.be.true;
			});

			// This will fail:
			//  - instanceof from another context
			//  - typeof (b/c it is a string instance)
			// https://github.com/enyojs/enyo/issues/2
			/* global iString */
			it('should determine strings written from other window contexts correctly', function () {
				expect(utils.isString(iString)).to.be.true;
			});
		});

		describe('indexOf', function () {
			it('should have proper index', function () {
				var index = utils.indexOf("foo", [null, null, null, null,"foo"]);
				expect(index).to.equal(4)
			});
		});

		describe('indexOf greater than array length', function () {
			it('should equal -1', function () {
				var index = utils.indexOf("foo", [null, null, null, null,"foo"], 10);
				expect(index).to.equal(-1)
			});
		});

		describe('AsyncMethod', function () {
			var timesCalled;

			before(function () {
				timesCalled = 0;
			});
			
			it('should be called twice', function (done) {
				utils.asyncMethod(function () { timesCalled++; });
				utils.asyncMethod(this, function (i) { timesCalled += i; }, 1);
				setTimeout(function() {
					expect(timesCalled).to.equal(2)
					done();
				}, 25);
			});
		});

		describe('isObject', function () {
			it('should be true that an object is an object', function () {
				expect(utils.isObject({})).to.be.true
			});

			it('should not be true that undefined is an object', function () {
				expect(utils.isObject(undefined)).to.be.false
			});

			it('should not be true that null is an object', function () {
				expect(utils.isObject(null)).to.be.false
			});

			it('should not be true that an array is an object', function () {
				expect(utils.isObject([1,2,3])).to.be.false
			});

			it('should not be true that a number is an object', function () {
				expect(utils.isObject(42)).to.be.false
			});

			it('should not be true that a string is an object', function () {
				expect(utils.isObject("forty-two")).to.be.false
			});
		});

		describe('isArray', function () {
			it('should not be true that an object is an array', function () {
				expect(utils.isArray({})).to.be.false
			});

			it('should not be true that undefined is an array', function () {
				expect(utils.isArray(undefined)).to.be.false
			});

			it('should not be true that null is an array', function () {
				expect(utils.isArray(null)).to.be.false
			});

			it('should be true that an array is an array', function () {
				expect(utils.isArray([1,2,3])).to.be.true
			});

			it('should not be true that a number is an array', function () {
				expect(utils.isArray(42)).to.be.false
			});

			it('should not be true that a string is an array', function () {
				expect(utils.isArray("forty-two")).to.be.false
			});
		});
	});
});