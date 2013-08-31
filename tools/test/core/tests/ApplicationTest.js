enyo.kind({
	name: "ApplicationTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testControllerCreation: function() {
		var TestApp = enyo.kind({
			kind: 'Application',
			renderOnStart: false,
			controllers: [{
				name: 'routes',
				kind: 'enyo.Router'
			}],
			view: {
				name: 'TestView',
				kind: 'View'
			}
		});

		var app = new TestApp();
		if (!(app.controllers.routes instanceof enyo.Router)) {
			this.finish("application controller not created");
		}
		app.destroy();
		app = new TestApp();
		if (!(app.controllers.routes instanceof enyo.Router)) {
			this.finish("application controller not re-created");
		}
		app.destroy();

		this.finish();
	}
});