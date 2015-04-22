var
		kind = require('../../lib/kind'),
		utils = require('../../lib/utils');

var
		Control = require('../../lib/Control');
		ViewController = require('../../lib/ViewController');

describe('ViewController', function () {

	describe('usage', function () {

//	testCreateViewObject: function () {
//		var vc = enyo.singleton({
//			kind: "enyo.ViewController",
//			view: {name: "vcv"}
//		});
//		this.finish(
//				(!vc.view && "view was somehow lost") ||
//				(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
//				((vc.view.name != "vcv" || vc.view.owner !== vc) && "view's name was lost and owner not set correctly")
//		);
//	},

		describe('Create ViewController', function () {

			var vc = kind.singleton({
				kind: ViewController,
				view: {name: "vcv"}
			});

			before(function () {
			});

			after(function () {
			});

			it ('should exist', function () {

				expect(vc.view).to.exist;

			});

		});

//	testCreateViewConstructor: function () {
//		var vvc = enyo.kind({kind: "enyo.Control", content: "vvc"}),
//				vc  = enyo.singleton({
//					kind: "enyo.ViewController",
//					view: vvc
//				});
//		this.finish(
//				(!vc.view && "view was somehow lost") ||
//				(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
//				(vc.view.owner !== vc && "owner not set correctly")
//		);
//	},
//

		describe('Create View in Constructor', function () {

			var vvc = kind({kind: Control, content: "vvc"}),
					vc  = kind.singleton({
						kind: ViewController,
						view: vvc
					});

			before(function () {
			});

			after(function () {
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

//	testCreateViewFromViewKind: function () {
//		var vvc = enyo.kind({kind: "enyo.Control", content: "vvc"}),
//				vc  = enyo.singleton({
//					kind: "enyo.ViewController",
//					viewKind: vvc
//				});
//		this.finish(
//				(!vc.view && "view was somehow lost") ||
//				(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
//				(vc.view.owner !== vc && "owner not set correctly")
//		);
//	},

		describe('Create View from ViewKind', function () {

			var vvc = kind({kind: Control, content: "vvc"}),
					vc  = kind.singleton({
						kind: ViewController,
						viewKind: vvc
					});

			before(function () {
			});

			after(function () {
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

//  ***** Ignore this test - AJD *****
//	testCreateViewFromViewKindStringConstructor: function () {
//		enyo.kind({name: "test.ViewController.VVC", kind: "enyo.Control", content: "vvc"});
//		var	vc = enyo.singleton({
//			kind: "enyo.ViewController",
//			viewKind: "test.ViewController.VVC"
//		});
//		/*global test:true */
//		test.ViewController.VVC = undefined;
//		this.finish(
//				(!vc.view && "view was somehow lost") ||
//				(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
//				(vc.view.owner !== vc && "owner not set correctly")
//		);
//	},
//  *************************************


//  ***** Ignore this test - AJD *****
//	testCreateViewFromViewStringConstructor: function () {
//		enyo.kind({name: "test.ViewController.VVC", kind: "enyo.Control", content: "vvc"});
//		var	vc = enyo.singleton({
//			kind: "enyo.ViewController",
//			view: "test.ViewController.VVC"
//		});
//		/*global test:true */
//		test.ViewController.VVC = undefined;
//		this.finish(
//				(!vc.view && "view was somehow lost") ||
//				(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
//				(vc.view.owner !== vc && "owner not set correctly")
//		);
//	},
//  *************************************

//	testEventsFromViewToController: function () {
//		enyo.kind({name: "test.ViewController.VVC", kind: "enyo.Control", events: {onBubbleEvent:""}});
//		var	vc = enyo.singleton({
//			kind: "enyo.ViewController",
//			view: "test.ViewController.VVC",
//			handlers: {
//				onBubbleEvent: "eventCaught"
//			},
//			eventCaught: enyo.bind(this, function () { this.finish(); })
//		});
//		/*global test:true */
//		test.ViewController.VVC = undefined;
//		vc.view.doBubbleEvent();
//	},

		describe('Events from View to Controller', function () {

			before(function () {
			});

			after(function () {
			});

			it ('should fire and catch event', function (done) {

				var vvc = kind({kind: Control, content: "vvc", events: {onBubbleEvent:""}}),
						vc  = kind.singleton({
							kind: ViewController,
							view: vvc,
							handlers: {
								onBubbleEvent: "eventCaught"
							},
							eventCaught: utils.bind(this, function () {
								done();
							})
						});

				/*global test:true */
				//test.ViewController.VVC = undefined;
				vc.view.doBubbleEvent();

			});

		});

//	testEventsFromControllerToView: function () {
//		enyo.kind({
//			name: "test.ViewController.VVC",
//			kind: "enyo.Control",
//			handlers: {
//				onWaterfallEvent: "eventCaught"
//			},
//			eventCaught: enyo.bind(this, function () { this.finish(); })
//		});
//		var	vc = enyo.singleton({
//			kind: "enyo.ViewController",
//			view: "test.ViewController.VVC"
//		});
//		/*global test:true */
//		test.ViewController.VVC = undefined;
//		vc.waterfallDown("onWaterfallEvent");
//	},

		describe('Events from Controller to View', function () {

			before(function () {
			});

			after(function () {
			});

			it ('should fire and catch event', function (done) {

				var vcc = kind({
					name: "test.ViewController.VVC",
					kind: Control,
					handlers: {
						onWaterfallEvent: "eventCaught"
					},
					eventCaught: utils.bind(this, function () {
						done();
					})
				});
				var	vc = kind.singleton({
					kind: ViewController,
					view: vcc
				});
				/*global test:true */
				//test.ViewController.VVC = undefined;
				vc.waterfallDown("onWaterfallEvent");

			});

		});

//	testViewControllerAsComponent: function () {
//		enyo.kind({
//			name: "test.ViewController.CVC",
//			kind: "enyo.Control",
//			components: [
//				{name: "controller", kind: "enyo.ViewController", view: {name: "vcv", content: "vcv"}}
//			]
//		});
//		/*global test:true */
//		var vc = new test.ViewController.CVC(),
//				v  = vc.$.controller.$.vcv;
//		test.ViewController.CVC = undefined;
//		this.finish(
//				(v.owner !== vc.$.controller && "controller was not the owner of the view") ||
//				(v.container !== vc && "container was not set correctly from controller to view") ||
//				(v.bubbleTarget !== vc.$.controller && "bubbleTarget was not set correctly as the controller") ||
//				(enyo.indexOf(v, vc.children) < 0 && "view was not added as a child to the owner controller")
//		);
//	},

		describe('Controller as Component', function () {

			var cvc = kind({
				name: "test.ViewController.CVC",
				kind: Control,
				components: [
					{name: "controller", kind: ViewController, view: {name: "vcv", content: "vcv"}}
				]
			});

			var vc = new cvc(),
					v  = vc.$.controller.$.vcv;

			before(function () {
			});

			after(function () {
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

//	testViewControllerAsComponentEvents: function () {
//		enyo.kind({
//			name: "test.ViewController.CVC",
//			kind: "enyo.Control",
//			handlers: {
//				onBubbleEvent: "eventCaught"
//			},
//			components: [
//				{name: "controller", kind: "enyo.ViewController", view: {name: "vcv", content: "vcv", events: {onBubbleEvent: ""}}}
//			],
//			eventCaught: enyo.bind(this, function () { this.finish(); })
//		});
//		/*global test:true */
//		var vc = new test.ViewController.CVC(),
//				v  = vc.$.controller.$.vcv;
//		test.ViewController.CVC = undefined;
//		v.doBubbleEvent();
//	},

		describe('ViewController as Component Events', function () {

			before(function () {
			});

			after(function () {
			});

			it ('should fire and catch event', function (done) {

				var cvc = kind({
					name: "test.ViewController.CVC",
					kind: Control,
					handlers: {
						onBubbleEvent: "eventCaught"
					},
					components: [
						{name: "controller", kind: ViewController, view: {name: "vcv", content: "vcv", events: {onBubbleEvent: ""}}}
					],
					eventCaught: utils.bind(this, function () {
						done();
					})
				});

				var vc = new cvc(),
						v  = vc.$.controller.$.vcv;

				/*global test:true */
				//test.ViewController.VVC = undefined;
				v.doBubbleEvent();

			});

		});

//	testAddLiveView: function () {
//		var v  = new enyo.Control(),
//				vc = new enyo.ViewController();
//		vc.set("view", v);
//		this.finish(
//				(!vc.view && "view was somehow lost") ||
//				(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
//				(vc.view.owner === vc && "view's owner was set as the controller even though it didn't create it") ||
//				(vc.view.bubbleTarget !== vc && "view's bubbleTarget was not the controller") ||
//				(vc.view !== v && "somehow the view doesn't match the instance added")
//		);
//	},

		describe('Add live view', function () {

			var v  = new Control(),
					vc = new ViewController();

			vc.set("view", v);

			before(function () {
			});

			after(function () {
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

//	testSwapLiveViews: function () {
//		var c  = 0,
//				v1 = new enyo.singleton({kind: "enyo.Control", events: {onBubbleEvent: ""}}),
//				v2 = new enyo.singleton({kind: "enyo.Control", events: {onBubbleEvent: ""}}),
//				vc = enyo.singleton({
//					kind: "enyo.ViewController",
//					handlers: {
//						onBubbleEvent: "eventCaught"
//					},
//					eventCaught: enyo.bind(this, function () { ++c; })
//				});
//		vc.set("view", v1);
//		this.finish(
//				(vc.view.doBubbleEvent() && c !== 1 && "event from first live view did not propagate") ||
//				(vc.set("view", v2) && vc.view.doBubbleEvent() && c !== 2 && "event from second live view did not propagate") ||
//				(v1.doBubbleEvent() && c === 3 && "event from removed live view still bubbled event to controller") ||
//				(vc.destroy() && v2.destroyed && "destroying the controller also destroyed the view")
//		);
//	},

		describe('Swap live views', function () {

			before(function () {
			});

			after(function () {
			});

			var c  = 0,
					v1 = new kind.singleton({kind: Control, events: {onBubbleEvent: ""}}),
					v2 = new kind.singleton({kind: Control, events: {onBubbleEvent: ""}}),
					vc = kind.singleton({
						kind: ViewController,
						handlers: {
							onBubbleEvent: "eventCaught"
						},
						eventCaught: utils.bind(this, function () { ++c; })
					});

			vc.set("view", v1);

			it ('should propagate event from first live view', function () {

				vc.view.doBubbleEvent();
				expect(c).to.equal(1);

			});


		});

//	testConditionalDestroyedViewWhenChanged: function () {
//		var vc1 = enyo.singleton({kind: "enyo.ViewController", viewKind: enyo.Control}),
//				vc2 = enyo.singleton({kind: "enyo.ViewController", viewKind: enyo.Control, resetView: true}),
//				v1  = vc1.view,
//				v2  = vc2.view;
//		v1.destroy();
//		v2.destroy();
//		this.finish(
//				((!v1.destroyed || vc1.view === v1 || v1.bubbleTarget === vc1) && "view was not properly removed when destroyed or removed") ||
//				((!v2.destroyed || vc2.view === v2 || !vc2.view || v2.bubbleTarget === vc2) && "view was not properly destroyed or recreated with resetView flag")
//		);
//	}

		describe('Conditional Destroyed View When Changed', function () {

			var vc1 = kind.singleton({kind: ViewController, viewKind: Control}),
					vc2 = kind.singleton({kind: ViewController, viewKind: Control, resetView: true}),
					v1  = vc1.view,
					v2  = vc2.view;

			v1.destroy();
			v2.destroy();

			before(function () {
			});

			after(function () {
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

