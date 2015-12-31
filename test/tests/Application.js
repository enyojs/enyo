var kind = require('enyo/kind'),
	Application = require('enyo/Application'),
	Router = require('enyo/Router');

describe('Application', function () {

	describe('usage', function () {

		describe('Controller creation', function () {
			var TestApp, app;
			before(function () {
				TestApp = kind({
					kind: Application,
					renderOnStart: false,
					components: [{
						name: 'routes',
						kind: Router
					}],
					view: {
						name: 'TestView'
					}
				});

				app = new TestApp();
			});

			after(function () {
				app.destroy();
				TestApp = app = null;
			});

			it('should create controller', function () {
				expect(app.$.routes).to.exist;
			});
		});

		describe('App property in children', function () {
			var a;

			before(function () {
				a = kind.singleton({
					kind: Application,
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
			});

			after(function () {
				a.destroy();
				a = null;
			});

			it('should have app property in all children', function () {
				for (var k in a.$) {
					expect(a.$[k].app).to.exist;
				}
			});
		});

		describe('App events up and back', function () {
			var a;

			before(function () {
				a = kind.singleton({
					kind: Application,
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
											{handlers: {onTopDown: "doBottomUp"}, events: {onBottomUp: ""}}
										]}
									]}
								]}
							]}
						]}
					]},
					bottomUp: function() {
						this.done();
					}
				});
			});

			after(function () {
				a.destroy();
				a = null;
			});

			it('should send events up and back', function (done) {
				a.done = done;
				a.waterfall("onTopDown");
			});
		});

		describe('Application bindings', function () {
			var a;

			before(function () {
				a = kind.singleton({
					kind: Application,
					renderOnStart: false,
					view: {
						name: "view",
						components: [
							{name: "child"}
						],
						bindings: [
							{from: "app.$.controller.data", to: "$.child.content"}
						]
					},
					components: [
						{name: "controller", data: "some value"} // should be a controller because of defaultKind!
					]
				});
			});

			after(function () {
				a.destroy();
				a = null;
			});

			it('should propagate bindings', function () {
				expect(a.view.$.child.content).to.deep.equal(a.$.controller.data);
			});
		});
	});
});
