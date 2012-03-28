/**
enyo.TranslateScrollStrategy is a helper kind that extends <a href="#enyo.TouchScrollStrategy">enyo.TouchScrollStrategy</a> 
to be optimized for scrolling environments in which effecting scroll changes with transform is fastest.

enyo.TranslateScrollStrategy is not typically created in application code.
*/
enyo.kind({
	name: "enyo.TranslateScrollStrategy",
	kind: "TouchScrollStrategy",
	clientClasses: "enyo-composite",
	nofitChanged: function() {
	},
	calcScrollNode: function() {
		return this.container.hasNode();
	},
	shouldDrag: function(inSender, inEvent) {
		// stop and update drag info before checking drag status
		this.stop();
		this.calcStartInfo();
		return this.inherited(arguments);
	},
	scrollMathStart: function(inSender) {
		this.inherited(arguments);
		if (this.scrollNode) {
			this.startX = this.getScrollLeft();
			this.startY = this.getScrollTop();
		}
	},
	scrollMathScroll: function(inSender) {
		this.scrollLeft = -inSender.x;
		this.scrollTop = -inSender.y;
		// hmph, scroll called after stop
		if (this.$.scrollMath.isScrolling()) {
			this.effectScroll(this.startX - this.scrollLeft, this.startY - this.scrollTop);
		}
		this.doScroll(inSender);
	},
	// while moving, scroller uses translate
	effectScroll: function(inX, inY) {
		var o = "translate3d(" + inX + "px, " + inY + "px," + "0)";
		this.effectTransform(this.$.client.hasNode(), o);
	},
	// when stopped, we use scrollLeft/Top (makes cursor positioning automagic)
	effectScrollStop: function() {
		this.effectTransform(this.$.client.hasNode(), "translate3d(0, 0, 0)");
		this.setScrollLeft(this.scrollLeft);
		this.setScrollTop(this.scrollTop);
	},
	down: enyo.nop
});
