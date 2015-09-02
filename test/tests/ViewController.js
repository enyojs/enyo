var
		kind = require('enyo/kind'),
		utils = require('enyo/utils');

var
		Control = require('enyo/Control');
		ViewController = require('enyo/ViewController');

describe('ViewController', function () {

	describe('usage', function () {

		describe('Create ViewController', function () {
			var vc;

			before(function () {
				vc = kind.singleton({
					kind: ViewController,
					view: {name: 'vcv'}
				});
			});

			after(function () {
				vc.destroy();
			});

			it ('should exist', function () {
				expect(vc.view).to.exist;
			});
		});

		describe('Create View in Constructor', function () {
			var vc;

			before(function () {
				var vvc = kind({kind: Control, content: 'vvc'});
				vc  = kind.singleton({
					kind: ViewController,
					view: vvc
				});
			});

			after(function () {
				vc.destroy();
			});

			it ('should exist', function () {
				expect(vc.view).to.exist;
			});

			it ('should be an instance of enyo.Control', function () {
				expect(vc.view).to.be.an.instanceof(Control);
			});

			it ('should be owned by the ViewController', function () {
				expect(vc.view.owner).to.deep.equal(vc);
			});
		});

		describe('Create View from ViewKind', function () {
			var vc;

			before(function () {
				var vvc = kind({kind: Control, content: 'vvc'});
				vc  = kind.singleton({
					kind: ViewController,
					viewKind: vvc
				});
			});

			after(function () {
				vc.destroy();
			});

			it ('should exist', function () {
				expect(vc.view).to.exist;
			});

			it ('should be an instance of enyo.Control', function () {
				expect(vc.view).to.be.an.instanceof(Control);
			});

			it ('should be owned by the ViewController', function () {
				expect(vc.view.owner).to.deep.equal(vc);
			});
		});


		describe('Events from View to Controller', function () {
			var vc;

			before(function () {
				var vvc = kind({kind: Control, content: 'vvc', events: {onBubbleEvent:''}});
				vc = kind.singleton({
					kind: ViewController,
					view: vvc,
					handlers: {
						onBubbleEvent: 'eventCaught'
					},
					eventCaught: function () {
						this.done();
					}
				});
			});

			after(function () {
				vc.destroy();
			});

			it ('should fire and catch event', function (done) {
				vc.done = done;
				vc.view.doBubbleEvent();
			});
		});

		describe('Events from Controller to View', function () {
			var vc;

			before(function () {
				var vcc = kind({
					name: 'test.ViewController.VVC',
					kind: Control,
					handlers: {
						onWaterfallEvent: 'eventCaught'
					},
					eventCaught: function () {
						this.done();
					}
				});
				vc = kind.singleton({
					kind: ViewController,
					view: vcc
				});
			});

			after(function () {
				vc.destroy();
			});

			it ('should fire and catch event', function (done) {
				vc.view.done = done;
				vc.waterfallDown('onWaterfallEvent');
			});
		});

		describe('Controller as Component', function () {
			var v, vc;

			before(function () {
				var cvc = kind({
					name: 'test.ViewController.CVC',
					kind: Control,
					components: [
						{name: 'controller', kind: ViewController, view: {name: 'vcv', content: 'vcv'}}
					]
				});

				vc = new cvc();
				v  = vc.$.controller.$.vcv;
			});

			after(function () {
				vc.destroy();
			});

			it ('should be owned by the ViewController', function () {
				expect(v.owner).to.deep.equal(vc.$.controller);
			});

			it ('should have container set correctly', function () {
				expect(v.container).to.deep.equal(vc);
			});

			it ('should have bubbleTarget set as controller', function () {
				expect(v.bubbleTarget).to.deep.equal(vc.$.controller);
			});

			it ('should have view added as child of owner controller', function () {
				expect(utils.indexOf(v, vc.children)).to.be.at.least(0);
			});
		});

		describe('ViewController as Component Events', function () {
			var v, vc;

			before(function () {
				var cvc = kind({
					name: 'test.ViewController.CVC',
					kind: Control,
					handlers: {
						onBubbleEvent: 'eventCaught'
					},
					components: [
						{name: 'controller', kind: ViewController, view: {name: 'vcv', content: 'vcv', events: {onBubbleEvent: ''}}}
					],
					eventCaught: function () {
						this.done();
					}
				});

				vc = new cvc();
				v  = vc.$.controller.$.vcv;
			});

			after(function () {
				vc.destroy();
			});

			it ('should fire and catch event', function (done) {
				vc.done = done;
				v.doBubbleEvent();
			});
		});

		describe('Add live view', function () {
			var v, vc;

			before(function () {
				v  = new Control();
				vc = new ViewController();
				vc.set('view', v);
			});

			after(function () {
				v.destroy();
				vc.destroy();
			});

			it ('should exist', function () {
				expect(vc.view).to.exist;
			});

			it ('should be an instance of enyo.Control', function () {
				expect(vc.view).to.be.an.instanceof(Control);
			});

			it ('should not be owned by the ViewController', function () {
				expect(vc.view.owner).to.not.deep.equal(vc);
			});

			it ('should have the ViewController as view\'s bubbleTarget', function () {
				expect(vc.view.bubbleTarget).to.deep.equal(vc);
			});

			it ('should match the instance added', function () {
				expect(vc.view).to.deep.equal(v);
			});
		});

		describe('Swap live views', function () {
			var c, v1, v2, vc;

			before(function () {
				c  = 0;
				v1 = new kind.singleton({kind: Control, events: {onBubbleEvent: ''}});
				v2 = new kind.singleton({kind: Control, events: {onBubbleEvent: ''}});
				vc = kind.singleton({
					kind: ViewController,
					handlers: {
						onBubbleEvent: 'eventCaught'
					},
					eventCaught: function () {
						++c;
					}
				});
				vc.set('view', v1);
			});

			after(function () {
				v1.destroy();
			});

			it ('should propagate event from first live view', function () {
				vc.view.doBubbleEvent();
				expect(c).to.equal(1);
			});

			it ('should propagate event from second live view', function () {
				vc.set('view', v2);
				vc.view.doBubbleEvent();
				expect(c).to.equal(2);
			});

			it ('should not bubble event to controller live view removed', function () {
				v1.doBubbleEvent();
				expect(c).to.equal(2);
			});

			it ('should destroy the view when the controller is destroyed', function () {
				vc.destroy();
				expect(v2.destroyed).to.be.false;
			});
		});

		describe('Conditional Destroyed View When Changed', function () {
			var vc1, vc2, v1, v2;

			before(function () {
				vc1 = kind.singleton({kind: ViewController, viewKind: Control});
				vc2 = kind.singleton({kind: ViewController, viewKind: Control, resetView: true});
				v1  = vc1.view;
				v2  = vc2.view;

				v1.destroy();
				v2.destroy();
			});

			after(function () {
				vc1.destroy();
				vc2.destroy();
			});

			it ('should properly remove view when destroyed or removed', function () {
				expect(v1.destroyed).to.be.true;
				expect(vc1.view).to.not.deep.equal(v1);
				expect(v1.bubbleTarget).to.not.deep.equal(vc1);
			});

			it ('should properly destroy or recreate view with resetView flag', function () {
				expect(v2.destroyed).to.be.true;
				expect(vc2.view).to.not.deep.equal(v2);
				expect(vc2.view).to.exist;
				expect(v2.bubbleTarget).to.not.deep.equal(vc2);
			});
		});
	});
});