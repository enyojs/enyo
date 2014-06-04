enyo.kind({
	name: "ControllerTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testGlobalProperty: function () {
		/*global test:true */
		var c = enyo.singleton({
			name: "test.global.controller",
			kind: "enyo.Controller",
			global: true
		});
		this.finish(
			(c !== test.global.controller && "controller was not set globally as expected")
		);
	}
});
