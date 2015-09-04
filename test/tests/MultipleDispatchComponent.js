var
	kind = require('enyo/kind'),
	utils = require('enyo/utils');

var
	Component = require('enyo/Component'),
	MultipleDispatchComponent = require('enyo/MultipleDispatchComponent');

describe('MultipleDispatch', function () {

	describe('usage', function () {

		describe('Default dispatch', function () {
			var p, c;
			before(function () {
				var Parent = kind({
						kind: Component,
						handlers: {
							onTest1: "accept"
						},
						accept: function () {
							this.done();
						}
					}),
					Child = kind({
						kind: MultipleDispatchComponent,
						events: {
							onTest1: ""
						}
					});

				p = new Parent();
				c = new Child({owner: p});
			});

			after(function () {
				p.destroy();
				c.destroy();
			});

			it ('should have default dispatch path', function (done) {
				p.done = done;
				c.doTest1();
				expect(c._dispatchDefaultPath).to.exist;
			});
		});

		describe('Add dispatch target', function () {
			var dc;

			before(function () {
				var DispatchComponent = kind({
					kind: MultipleDispatchComponent,
					events: {
						onTest1: ""
					}
				});

				dc = new DispatchComponent();
			});

			after(function () {
				dc.destroy();
			});

			it ('should have _dispatchTargets', function () {
				expect(dc._dispatchTargets).to.exist;
			});

			it ('should have dispatch targets zeroed out', function () {
				expect(dc._dispatchTargets.length).to.equal(0);
			});

			it ('should add dispatch target properly', function () {
				dc.addDispatchTarget(new Component());
				expect(dc._dispatchTargets.length).to.equal(1);
			});
		});

		describe('Remove dispatch target', function () {
			var dc, c;

			before(function () {
				var DispatchComponent = kind({
					kind: MultipleDispatchComponent,
					events: {
						onTest1: ""
					}
				});

				dc = new DispatchComponent();
			});

			after(function () {
				dc.destroy();
			});

			it ('should add dispatch target properly', function () {
				dc.addDispatchTarget((c = new Component()));
				expect(dc._dispatchTargets.length).to.equal(1);
			});

			it ('should remove dispatch target properly', function () {
				dc.removeDispatchTarget(c);
				expect(dc._dispatchTargets.length).to.equal(0);
			});
		});

		describe('Multiple listeners without owner', function () {
			var ex = 4,
				TestComponent, dc;

			before(function () {
				TestComponent = kind({
					kind: Component,
					handlers: {
						onTest1: "accept"
					},
					accept: function () {
						--ex;
						console.log('ex=', ex);
						if (ex === 0) {
							this.done();
						}
					}
				});

				var DispatchComponent = kind({
					kind: MultipleDispatchComponent,
					events: {
						onTest1: ""
					}
				});
				dc = new DispatchComponent();
			});

			after(function () {
				TestComponent = null;
				dc.destroy();
			});

			it ('should have multiple listeners', function (done) {
				for (var i = 0; i < 4; ++i) {
					dc.addDispatchTarget(new TestComponent({done: done}));
				}
				dc.doTest1();
			});
		});

		describe('Multiple listeners with owner', function () {
			var ex = 5,
				TestComponent, c, dc;

			before(function () {
				TestComponent = kind({
					kind: Component,
					handlers: {
						onTest1: "accept"
					},
					accept: function () {
						--ex;
						if (ex === 0) {
							this.done();
						}
					}
				});
				DispatchComponent = kind({
					kind: MultipleDispatchComponent,
					events: {
						onTest1: ""
					}
				});

				c = new TestComponent({name: "NotAutoCreated"});
				dc = new DispatchComponent({owner: c});
			});

			after(function () {
				c.destroy();
				TestComponent = null;
			});

			it ('should have multiple listeners', function (done) {
				for (var i = 0; i < 5; ++i) {
					dc.addDispatchTarget(new TestComponent({done: done}));
				}
				dc.doTest1();
			});
		});
	});
});