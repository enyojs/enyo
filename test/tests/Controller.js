var kind = require('../../lib/kind'),
		Controller = require('../../lib/Controller');

describe('Controller', function () {

	describe('usage', function () {

		describe('Global property', function () {

			var c = kind.singleton({
				name: "test.global.controller",
				kind: Controller,
				global: true
			});

			before(function () {
			});

			after(function () {
			});

			it('should be set globally', function () {

				expect(c).to.deep.equal(test.global.controller);

			});
		});

	});
});

//	testGlobalProperty: function () {
//		/*global test:true */
//		var c = enyo.singleton({
//			name: "test.global.controller",
//			kind: "enyo.Controller",
//			global: true
//		});
//		this.finish(
//				(c !== test.global.controller && "controller was not set globally as expected")
//		);
//	}
