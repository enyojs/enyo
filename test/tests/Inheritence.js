var CoreObject = require('enyo/CoreObject'),
	Component = require('enyo/Component'),
	UiComponent = require('enyo/UiComponent'),
	Control = require('enyo/Control');

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