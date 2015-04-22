var CoreObject = require('../../lib/CoreObject'),
		Component = require('../../lib/Component'),
		UiComponent = require('../../lib/UiComponent'),
		Control = require('../../lib/Control');

describe('Inherentence Sanity Tests', function () {

	describe('usage', function () {

		describe('CoreObject', function () {

			before(function () {
			});

			after(function () {
			});

			it('should be an instance of Object', function () {

				expect(CoreObject).to.be.instanceOf(Object);

			});
		});

		describe('Component', function () {

			before(function () {
			});

			after(function () {
			});

			it('should be an instance of CoreObject', function () {

				expect(Component.prototype).to.be.instanceOf(CoreObject);

			});
		});

		describe('UiComponent', function () {

			before(function () {
			});

			after(function () {
			});

			it('should be an instance of CoreObject', function () {

				expect(UiComponent.prototype).to.be.instanceOf(CoreObject);

			});
		});

		describe('Control', function () {

			before(function () {
			});

			after(function () {
			});

			it('should be an instance of CoreObject', function () {

				expect(Control.prototype).to.be.instanceOf(CoreObject);

			});
		});

	});
});

//enyo.kind({
//	name: "InheritanceSanityTest",
//	kind: enyo.TestSuite,
//	noDefer: true,

//	testObject: function () {
//		this.finish(!(enyo.Object && enyo.Object instanceof Object));
//	},
//	testComponent: function () {
//		this.finish(!(enyo.Component && enyo.Component.prototype instanceof enyo.Object));
//	},
//	testUiComponent: function () {
//		this.finish(!(enyo.UiComponent && enyo.UiComponent.prototype instanceof enyo.Object));
//	},
//	testControl: function () {
//		this.finish(!(enyo.Control && enyo.Control.prototype instanceof enyo.Object));
//	}
//});
