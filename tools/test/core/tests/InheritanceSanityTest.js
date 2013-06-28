enyo.kind({
	name: "InheritanceSanityTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testObject: function () {
		this.finish(!(enyo.Object && enyo.Object instanceof Object));
	},
	testComponent: function () {
		this.finish(!(enyo.Component && enyo.Component.prototype instanceof enyo.Object));
	},
	testUiComponent: function () {
		this.finish(!(enyo.UiComponent && enyo.UiComponent.prototype instanceof enyo.Object));
	},
	testControl: function () {
		this.finish(!(enyo.Control && enyo.Control.prototype instanceof enyo.Object));
	}
});