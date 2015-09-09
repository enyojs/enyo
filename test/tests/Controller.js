var kind = require('enyo/kind'),
	Controller = require('enyo/Controller');

describe('Controller', function () {

	describe('usage', function () {

		describe('Global property', function () {
			var c;

			before(function () {
				c = new (kind({
					kind: Controller,
					global: true
				}))({name: 'test.global.controller'});
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