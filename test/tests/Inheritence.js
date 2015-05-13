var CoreObject = require('../../lib/CoreObject'),
	Component = require('../../lib/Component'),
	UiComponent = require('../../lib/UiComponent'),
	Control = require('../../lib/Control');

describe('Inherentence Sanity Tests', function () {

	describe('usage', function () {

		describe('CoreObject', function () {
			it('should be an instance of Object', function () {
				expect(CoreObject).to.be.instanceOf(Object);
			});
		});

		describe('Component', function () {
			it('should be an instance of CoreObject', function () {
				expect(Component.prototype).to.be.instanceOf(CoreObject);
			});
		});

		describe('UiComponent', function () {
			it('should be an instance of CoreObject', function () {
				expect(UiComponent.prototype).to.be.instanceOf(CoreObject);
			});
		});

		describe('Control', function () {
			it('should be an instance of CoreObject', function () {
				expect(Control.prototype).to.be.instanceOf(CoreObject);
			});
		});
	});
});