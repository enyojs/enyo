enyo.kind({
	name: "ApplicationTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testControllerCreation: function() {
		var TestApp = enyo.kind({
			kind: 'Application',
			renderOnStart: false,
			components: [{
				name: 'routes',
				kind: 'enyo.Router'
			}],
			view: {
				name: 'TestView',
				kind: 'View'
			}
		});

		var app = new TestApp();
		if (!(app.$.routes instanceof enyo.Router)) {
			this.finish("application controller not created");
		}
		app.destroy();
		app = new TestApp();
		if (!(app.$.routes instanceof enyo.Router)) {
			this.finish("application controller not re-created");
		}
		app.destroy();

		this.finish();
	},
	testComponentsAppProperty: function () {
		var a = enyo.singleton({
			name: "test.Application.App",
			kind: "enyo.Application",
			renderOnStart: false,
			view: {
				components: [
					{components: [
						{components: [							
							{}
						]}
					]}
				]
			}
		});
		for (var k in a.$) {
			if (!a.$[k].app) {
				this.finish("app was not propagated to children as expected");
			}
		}
		this.finish();
	},
	testViewTreeEventsUpAndBack: function () {
		var a = enyo.singleton({
			kind: "enyo.Application",
			renderOnStart: false,
			handlers: {
				onBottomUp: "bottomUp"
			},
			view: {components: [
				{components: [
					{components: [
						{components: [
							{components: [
								{components: [
									{handlers: {onTopDown: "doBottomUp"}, events: {onBottomUp:""}}
								]}
							]}
						]}
					]}
				]}
			]},
			bottomUp: enyo.bind(this, function () {
				// has the context of the test method, not the
				// application
				this.finish();
			})
		});
		a.waterfall("onTopDown");
	},
	testApplicationBindings: function () {
		var a = enyo.singleton({
			kind: "enyo.Application",
			renderOnStart: false,
			view: {
				name: "view",
				components: [
					{name: "child"}
				],
				bindings: [
					{from: ".app.$.controller.data", to: ".$.child.content"}
				]
			},
			components: [
				{name: "controller", data: "some value"} // should be a controller because of defaultKind!
			]
		});
		this.finish(
			(a.view.$.child.content != a.$.controller.data && "the binding did not propagate as expected")
		);
	},
	testCompatibilityOfApplicationBindings: function () {
		var a = enyo.singleton({
			kind: "enyo.Application",
			renderOnStart: false,
			view: {
				name: "view",
				components: [
					{name: "child1"},
					{name: "child2"}
				],
				bindings: [
					{from: ".app.$.controller.data", to: ".$.child1.content"},
					{from: ".app.controllers.controller.data", to: ".$.child2.content"}
				]
			},
			controllers: [
				{name: "controller", data: "some value"} // should be a controller because of defaultKind!
			]
		});
		this.finish(
			(a.view.$.child1.content != a.$.controller.data && "the correct binding did not work") ||
			(a.view.$.child2.content != a.$.controller.data && "the deprecated binding did not work")
		);
	}
});