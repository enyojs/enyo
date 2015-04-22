var kind = require('../../lib/kind');
var Application = require('../../lib/Application');
var Router = require('../../lib/Router');

describe('Application', function () {

	describe('usage', function () {

//	testControllerCreation: function() {
//		var TestApp = enyo.kind({
//			kind: 'Application',
//			renderOnStart: false,
//			components: [{
//				name: 'routes',
//				kind: 'enyo.Router'
//			}],
//			view: {
//				name: 'TestView'
//			}
//		});
//
//		var app = new TestApp();
//		if (!(app.$.routes instanceof enyo.Router)) {
//			this.finish("application controller not created");
//		}
//		app.destroy();
//		app = new TestApp();
//		if (!(app.$.routes instanceof enyo.Router)) {
//			this.finish("application controller not re-created");
//		}
//		app.destroy();
//
//		this.finish();
//	},

		describe('Controller creation', function () {

			before(function () {
			});

			after(function () {
			});

			var TestApp = kind({
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

			var app = new TestApp();
			var routes = app.$.routes;

			it('should create controller', function () {

				expect(routes).to.exist;

			});

			app.destroy();

		});

//	testComponentsAppProperty: function () {
//		var a = enyo.singleton({
//			name: "test.Application.App",
//			kind: "enyo.Application",
//			renderOnStart: false,
//			view: {
//				components: [
//					{components: [
//						{components: [
//							{}
//						]}
//					]}
//				]
//			}
//		});
//		for (var k in a.$) {
//			if (!a.$[k].app) {
//				this.finish("app was not propagated to children as expected");
//			}
//		}
//		this.finish();
//	},

		describe('App property in children', function () {

			before(function () {
			});

			after(function () {
			});

			var a = kind.singleton({
				name: "test.Application.App",
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
			for (var k in a.$) {
				var appProp = a.$[k].app;

				it('should have app property in all children', function () {

					expect(appProp).to.exist;

				});
			}

		});

//	testViewTreeEventsUpAndBack: function () {
//		var a = enyo.singleton({
//			kind: "enyo.Application",
//			renderOnStart: false,
//			handlers: {
//				onBottomUp: "bottomUp"
//			},
//			view: {components: [
//				{components: [
//					{components: [
//						{components: [
//							{components: [
//								{components: [
//									{handlers: {onTopDown: "doBottomUp"}, events: {onBottomUp:""}}
//								]}
//							]}
//						]}
//					]}
//				]}
//			]},
//			bottomUp: enyo.bind(this, function () {
//				// has the context of the test method, not the
//				// application
//				this.finish();
//			})
//		});
//		a.waterfall("onTopDown");
//	},

		describe('App events up and back', function () {

			before(function () {
			});

			after(function () {
			});

			it('should send events up and back', function (done) {

				var a = kind.singleton({
					kind: Application,
					renderOnStart: false,
					handlers: {
						onBottomUp: "bottomUp"
					},
					view: {
						components: [
							{
								components: [
									{
										components: [
											{
												components: [
													{
														components: [
															{
																components: [
																	{handlers: {onTopDown: "doBottomUp"}, events: {onBottomUp: ""}}
																]
															}
														]
													}
												]
											}
										]
									}
								]
							}
						]
					},
					bottomUp: function() {
						done();
					}

				});

				a.waterfall("onTopDown");

			})

		});

//	testApplicationBindings: function () {
//		var a = enyo.singleton({
//			kind: "enyo.Application",
//			renderOnStart: false,
//			view: {
//				name: "view",
//				components: [
//					{name: "child"}
//				],
//				bindings: [
//					{from: ".app.$.controller.data", to: ".$.child.content"}
//				]
//			},
//			components: [
//				{name: "controller", data: "some value"} // should be a controller because of defaultKind!
//			]
//		});
//		this.finish(
//				(a.view.$.child.content != a.$.controller.data && "the binding did not propagate as expected")
//		);
//	}

		describe('Application bindings', function () {

			before(function () {
			});

			after(function () {
			});

			it('should propagate bindings', function () {

				var a = kind.singleton({
					kind: Application,
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

				expect(a.view.$.child.content).to.deep.equal(a.$.controller.data);

			});

		});

	});
});
