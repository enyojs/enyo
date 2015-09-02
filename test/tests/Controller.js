var kind = require('enyo/kind'),
	Controller = require('enyo/Controller');

describe('Controller', function () {

	describe('usage', function () {

		describe('Global property', function () {
			var c;

			before(function () {
				c = kind.singleton({
					name: 'test.global.controller',
					kind: Controller,
					global: true
				});
			});

			after(function () {
				c.destroy();
			});

			it('should be set globally', function () {
				expect(c).to.deep.equal(test.global.controller);
			});
		});
	});
});