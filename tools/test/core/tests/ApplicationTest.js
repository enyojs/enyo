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
	},
	testComponentsAppProperty: function () {
		var a = enyo.singleton({
			name: "test.Application.App",
			kind: "enyo.Application",
			renderOnStart: false,
			view: {
				name: "1",
				components: [
					{name: "2", components: [
						{name: "3", components: [							
							{name: "4"}
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
	}
	
});