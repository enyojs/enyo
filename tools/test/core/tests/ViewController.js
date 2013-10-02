enyo.kind({
	name: "ViewControllerTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testCreateViewObject: function () {
		var vc = enyo.singleton({
			kind: "enyo.ViewController",
			view: {name: "vcv"}
		});
		this.finish(
			(!vc.view && "view was somehow lost") ||
			(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
			((vc.view.name != "vcv" || vc.view.owner !== vc) && "view's name was lost and owner not set correctly")
		);
	},
	testCreateViewConstructor: function () {
		var vvc = enyo.kind({kind: "enyo.Control", content: "vvc"}),
			vc  = enyo.singleton({
				kind: "enyo.ViewController",
				view: vvc
			});
		this.finish(
			(!vc.view && "view was somehow lost") ||
			(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
			(vc.view.owner !== vc && "owner not set correctly")
		);
	},
	testCreateViewFromViewKind: function () {
		var vvc = enyo.kind({kind: "enyo.Control", content: "vvc"}),
			vc  = enyo.singleton({
				kind: "enyo.ViewController",
				viewKind: vvc
			});
		this.finish(
			(!vc.view && "view was somehow lost") ||
			(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
			(vc.view.owner !== vc && "owner not set correctly")
		);
	},
	testCreateViewFromViewKindStringConstructor: function () {
		enyo.kind({name: "test.ViewController.VVC", kind: "enyo.Control", content: "vvc"});
		var	vc = enyo.singleton({
			kind: "enyo.ViewController",
			viewKind: "test.ViewController.VVC"
		});
		/*global test:true */
		test.ViewController.VVC = undefined;
		this.finish(
			(!vc.view && "view was somehow lost") ||
			(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
			(vc.view.owner !== vc && "owner not set correctly")
		);
	},
	testCreateViewFromViewStringConstructor: function () {
		enyo.kind({name: "test.ViewController.VVC", kind: "enyo.Control", content: "vvc"});
		var	vc = enyo.singleton({
			kind: "enyo.ViewController",
			view: "test.ViewController.VVC"
		});
		/*global test:true */
		test.ViewController.VVC = undefined;
		this.finish(
			(!vc.view && "view was somehow lost") ||
			(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
			(vc.view.owner !== vc && "owner not set correctly")
		);
	},
	testEventsFromViewToController: function () {
		enyo.kind({name: "test.ViewController.VVC", kind: "enyo.Control", events: {onBubbleEvent:""}});
		var	vc = enyo.singleton({
			kind: "enyo.ViewController",
			view: "test.ViewController.VVC",
			handlers: {
				onBubbleEvent: "eventCaught"
			},
			eventCaught: enyo.bind(this, function () { this.finish(); })
		});
		/*global test:true */
		test.ViewController.VVC = undefined;
		vc.view.doBubbleEvent();
	},
	testEventsFromControllerToView: function () {
		enyo.kind({
			name: "test.ViewController.VVC",
			kind: "enyo.Control",
			handlers: {
				onWaterfallEvent: "eventCaught"
			},
			eventCaught: enyo.bind(this, function () { this.finish(); })
		});
		var	vc = enyo.singleton({
			kind: "enyo.ViewController",
			view: "test.ViewController.VVC"
		});
		/*global test:true */
		test.ViewController.VVC = undefined;
		vc.waterfallDown("onWaterfallEvent");
	},
	testViewControllerAsComponent: function () {
		enyo.kind({
			name: "test.ViewController.CVC",
			kind: "enyo.Control",
			components: [
				{name: "controller", kind: "enyo.ViewController", view: {name: "vcv", content: "vcv"}}
			]
		});
		/*global test:true */
		var vc = new test.ViewController.CVC(),
			v  = vc.$.controller.$.vcv;
		test.ViewController.CVC = undefined;
		this.finish(
			(v.owner !== vc.$.controller && "controller was not the owner of the view") ||
			(v.container !== vc && "container was not set correctly from controller to view") ||
			(v.bubbleTarget !== vc.$.controller && "bubbleTarget was not set correctly as the controller") ||
			(enyo.indexOf(v, vc.children) < 0 && "view was not added as a child to the owner controller")
		);
	},
	testViewControllerAsComponentEvents: function () {
		enyo.kind({
			name: "test.ViewController.CVC",
			kind: "enyo.Control",
			handlers: {
				onBubbleEvent: "eventCaught"
			},
			components: [
				{name: "controller", kind: "enyo.ViewController", view: {name: "vcv", content: "vcv", events: {onBubbleEvent: ""}}}
			],
			eventCaught: enyo.bind(this, function () { this.finish(); })
		});
		/*global test:true */
		var vc = new test.ViewController.CVC(),
			v  = vc.$.controller.$.vcv;
		test.ViewController.CVC = undefined;
		v.doBubbleEvent();
	},
	testAddLiveView: function () {
		var v  = new enyo.Control(),
			vc = new enyo.ViewController();
		vc.set("view", v);
		this.finish(
			(!vc.view && "view was somehow lost") ||
			(!(vc.view instanceof enyo.Control) && "view was not an enyo.Control") ||
			(vc.view.owner === vc && "view's owner was set as the controller even though it didn't create it") ||
			(vc.view.bubbleTarget !== vc && "view's bubbleTarget was not the controller") ||
			(vc.view !== v && "somehow the view doesn't match the instance added")
		);
	},
	testSwapLiveViews: function () {
		var c  = 0,
			v1 = new enyo.singleton({kind: "enyo.Control", events: {onBubbleEvent: ""}}),
			v2 = new enyo.singleton({kind: "enyo.Control", events: {onBubbleEvent: ""}}),
			vc = enyo.singleton({
				kind: "enyo.ViewController",
				handlers: {
					onBubbleEvent: "eventCaught"
				},
				eventCaught: enyo.bind(this, function () { ++c; })
			});
		vc.set("view", v1);
		this.finish(
			(vc.view.doBubbleEvent() && c !== 1 && "event from first live view did not propagate") ||
			(vc.set("view", v2) && vc.view.doBubbleEvent() && c !== 2 && "event from second live view did not propagate") ||
			(v1.doBubbleEvent() && c === 3 && "event from removed live view still bubbled event to controller") ||
			(vc.destroy() && v2.destroyed && "destroying the controller also destroyed the view")
		);
	},
	testConditionalDestroyedViewWhenChanged: function () {
		var vc1 = enyo.singleton({kind: "enyo.ViewController", viewKind: enyo.Control}),
			vc2 = enyo.singleton({kind: "enyo.ViewController", viewKind: enyo.Control, resetView: true}),
			v1  = vc1.view,
			v2  = vc2.view;
		v1.destroy();
		v2.destroy();
		this.finish(
			((!v1.destroyed || vc1.view === v1 || v1.bubbleTarget === vc1) && "view was not properly removed when destroyed or removed") ||
			((!v2.destroyed || vc2.view === v2 || !vc2.view || v2.bubbleTarget === vc2) && "view was not properly destroyed or recreated with resetView flag")
		);
	}
});
