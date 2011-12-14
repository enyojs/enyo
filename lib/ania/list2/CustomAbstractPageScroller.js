/**
	Uses PageStrategy to implement an abstract (vertical) virtual DOM scroller.
		* Coordinates scrollStrategy and pageStrategy
		* Implements DOM content scrolling (FIXME: abstract this too?)
*/
enyo.kind({
	name: "enyo.list.CustomAbstractPageScroller",
	kind: enyo.DragScroller,
	bottomUp: false,
	scrollKind: "list.scroller.Translate3d",
	style: "position: relative;",
	components: [
		// enyo-fit wrapper necessary to prevent layout leakage
		{className: "enyo-fit", style: "overflow: hidden;", components: [
			// important for compositing that this height be fixed, as to avoid reallocating textures
			{name: "client", height: "2048px"},
			{kind: "list.PageStrategy"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.createScrollerFromKind(this.scrollKind);
	},
	createScrollerFromKind: function(inKind) {
		var ctor = inKind && enyo.constructorForKind(inKind);
		if (ctor) {
			this.scroller = new ctor(this);
		}
	},
	rendered: function() {
		this.inherited(arguments);
		this.update();
	},
	update: function() {
		if (this.hasNode()) {
			this.$.pageStrategy.viewSize = this.hasNode().clientHeight;
			// ask page strategy to find a stable scroll position
			var p = this.$.pageStrategy.stabilize();
			if (p || p === 0) {
				p = this.bottomUp ? -p : p;
				this.$.scroll.setScrollPosition(p);
			}
			// translate the boundaries for the scroller
			this.mapBoundaries();
			// synchronize the scroller
			// FIXME: moved out of this function so we can mess with client visibility
			// before trying to scroll
			//this.scroll();
			// REMOVE: if stabilize is working, we shouldn't need to invoke
			// scroller dynamics
			//this.$.scroll.start();
		}
	},
	scroll: function() {
		this.$.pageStrategy.viewSize = this.hasNode().clientHeight;
		var s = this.$.pageStrategy.scroll(this.$.scroll.y, this.bottomUp);
		this.scroller.effectScroll(this.$.client, s);
		this.mapBoundaries();
	},
	mapBoundaries: function() {
		var s = this.$.scroll, p = this.$.pageStrategy;
		if (this.bottomUp) {
			s.bottomBoundary = -p.topBoundary;
			s.topBoundary = -p.bottomBoundary;
		} else {
			s.bottomBoundary = p.bottomBoundary;
			s.topBoundary = p.topBoundary;
		}
	}
});

/**
	Polymorphic scroll effector
*/
enyo.kind({
	name: "enyo.list.scroller.Translate3d",
	effectScroll: function(inClient, inPosition) {
		var n = inClient.hasNode();
		if (n) {
			n.style.webkitTransform = 'translate3d(0,' + inPosition + 'px,0)';
		}
	}
});
