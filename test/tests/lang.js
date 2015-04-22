var utils = require('../../lib/utils');
var kind = require('../../lib/kind');

describe('language', function () {

	describe('usage', function () {

//	testCallee: function() {
//		var err = "";
//		var fn = function() {
//			err = (arguments.callee.displayName !== 'fn');
//		};
//		fn.displayName = "fn";
//		fn();
//		this.finish(err);
//	},

		describe('Callee', function () {

			before(function () {
			});

			after(function () {
			});

			var dn = '';
			var fn = function() {
				dn = arguments.callee.displayName;
			};

			fn.displayName = "fn";
			fn();

			it('should have proper callee', function () {

				expect(dn).to.equal('fn')

			});
		});

//	testClass: function() {
//		enyo.kind({
//			name: "AClass"
//		});
//		/* global AClass */
//		new AClass();
//		var err = (typeof AClass !== 'function');
//		this.finish(err);
//	},

		describe('Class', function () {

			before(function () {
			});

			after(function () {
			});

			var AClass = kind({
				name: "AClass"
			});
			/* global AClass */
			//new AClass();
			var dn = AClass;

			it('should be a function', function () {

				expect(AClass).to.be.a('function')

			});
		});

//	testisString: function() {
//
//		// Create alternate window context to write vars from
//		var iframe = document.createElement("iframe"),
//				iframeDoc, err;
//
//		document.body.appendChild(iframe);
//		iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//		iframeDoc.write("<script>parent.iString = new String('hello');</script>");
//		iframeDoc.close();
//
//		if (!enyo.isString("string")) {
//			err = "enyo.isString() cannot determine strings correctly";
//		}
//		// This will fail:
//		//  - instanceof from another context
//		//  - typeof (b/c it is a string instance)
//		// https://github.com/enyojs/enyo/issues/2
//		/* global iString */
//		if (!enyo.isString(iString)) {
//			err = "enyo.isString() cannot determine strings written from other window contexts correctly";
//		}
//
//		document.body.removeChild(iframe);
//		this.finish(err);
//	},

		describe('isString', function () {

			before(function () {
			});

			after(function () {
			});

			// Create alternate window context to write vars from
			var iframe = document.createElement("iframe"),
					iframeDoc, err;

			document.body.appendChild(iframe);
			iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
			iframeDoc.write("<script>parent.iString = new String('hello');</script>");
			iframeDoc.close();

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

			document.body.removeChild(iframe);

		});

//	testindexOfRegular: function() {
//		var index = enyo.indexOf("foo", [null, null, null, null,"foo"]);
//		this.finish(index !== 4 ? "Incorrect index" : false);
//	},

		describe('indexOf', function () {

			before(function () {
			});

			after(function () {
			});

			var index = utils.indexOf("foo", [null, null, null, null,"foo"]);

			it('should have proper index', function () {

				expect(index).to.equal(4)

			});
		});

//	testindexOfFromIndex: function() {
//		var index = enyo.indexOf("foo", [null, null, null, null,"foo"], 10);
//		this.finish(index !== -1 ? "if fromIndex is greater then array length, should return -1" : false);
//	},

		describe('indexOf greater than array length', function () {

			before(function () {
			});

			after(function () {
			});

			var index = utils.indexOf("foo", [null, null, null, null,"foo"], 10);

			it('should equal -1', function () {

				expect(index).to.equal(-1)

			});
		});

//	testAsyncMethod: function() {
//		var timesCalled = 0;
//		var self = this;
//		enyo.asyncMethod(function() { timesCalled++; });
//		enyo.asyncMethod(this, function(i) { timesCalled += 1; }, 1);
//		setTimeout(function() {
//			if (timesCalled != 2) {
//				self.finish("one or more asyncMethods not called");
//			} else {
//				self.finish();
//			}
//		}, 25);
//	},

		describe('AsyncMethod', function () {

			before(function () {
			});

			after(function () {
			});

			var timesCalled = 0;
			it('should be called twice', function (done) {
				utils.asyncMethod(function() { timesCalled++; });
				utils.asyncMethod(this, function(i) { timesCalled += 1; }, 1);
				setTimeout(function() {

					expect(timesCalled).to.equal(2)
					done();
					//if (timesCalled != 2) {
					//	self.finish("one or more asyncMethods not called");
					//} else {
					//	self.finish();
					//}
				}, 25);
			});
		});

//	testIsObject: function() {
//		if (!enyo.isObject({})) {
//			this.finish("enyo.isObject failed on object");
//			return;
//		}
//		if (enyo.isObject(undefined)) {
//			this.finish("enyo.isObject failed on undefined");
//			return;
//		}
//		if (enyo.isObject(null)) {
//			this.finish("enyo.isObject failed on null");
//			return;
//		}
//		if (enyo.isObject([1,2,3])) {
//			this.finish("enyo.isObject failed on array");
//			return;
//		}
//		if (enyo.isObject(42)) {
//			this.finish("enyo.isObject failed on number");
//			return;
//		}
//		if (enyo.isObject("forty-two")) {
//			this.finish("enyo.isObject failed on string");
//			return;
//		}
//		this.finish();
//	},

		describe('isObject', function () {

			before(function () {
			});

			after(function () {
			});

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

//	testIsArray: function() {
//		if (enyo.isArray({})) {
//			this.finish("enyo.isArray failed on object");
//			return;
//		}
//		if (enyo.isArray(undefined)) {
//			this.finish("enyo.isArray failed on undefined");
//			return;
//		}
//		if (enyo.isArray(null)) {
//			this.finish("enyo.isArray failed on null");
//			return;
//		}
//		if (!enyo.isArray([1,2,3])) {
//			this.finish("enyo.isArray failed on array");
//			return;
//		}
//		if (enyo.isArray(42)) {
//			this.finish("enyo.isArray failed on number");
//			return;
//		}
//		if (enyo.isArray("forty-two")) {
//			this.finish("enyo.isArray failed on string");
//			return;
//		}
//		this.finish();
//	}

		describe('isArray', function () {

			before(function () {
			});

			after(function () {
			});

			it('should be true that an object is an array', function () {

				expect(utils.isArray({})).to.be.false

			});

			it('should not be true that undefined is an array', function () {

				expect(utils.isArray(undefined)).to.be.false

			});

			it('should not be true that null is an array', function () {

				expect(utils.isArray(null)).to.be.false

			});

			it('should not be true that an array is an array', function () {

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
