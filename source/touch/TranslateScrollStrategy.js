/**
enyo.TranslateScrollStrategy is a helper kind that extends <a href="#enyo.TouchScrollStrategy">enyo.TouchScrollStrategy</a> 
to be optimized for scrolling environments in which effecting scroll changes with transform is fastest.

enyo.TranslateScrollStrategy is not typically created in application code.
*/
enyo.kind({
	name: "enyo.TranslateScrollStrategy",
	kind: "TouchScrollStrategy",
	clientClasses: "enyo-composite",
	components: [
		{name: "clientContainer", classes: "enyo-touch-scroller", attributes: {"onscroll": enyo.bubbler}, components: [
			{name: "client"}
		]}
	],
	calcScrollNode: function() {
		return this.$.clientContainer.hasNode();
		//return this.container.hasNode();
	},
	maxHeightChanged: function() {
		this.inherited(arguments);
		this.$.clientContainer.addRemoveClass("enyo-fit", !this.maxHeight);
	},
	shouldDrag: function(inSender, inEvent) {
		// stop and update drag info before checking drag status
		this.dragStop = true;
		this.stop();
		this.dragStop = false;
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
		if (this.isScrolling()) {
			this.effectScroll(this.startX - this.scrollLeft, this.startY - this.scrollTop);
			if (this.thumb) {
				this.updateThumbs();
			}
		}
		this.doScroll(inSender);
	},
	scrollMathStop: function(inSender) {
		this.effectScrollStop();
		if (this.thumb && !this.dragStop) {
			this.hideThumbs(100);
		}
		this.doScrollStop(inSender);
	},
	// while moving, scroller uses translate
	effectScroll: function(inX, inY) {
		var o = inX + "px, " + inY + "px, 0";
		this.effectTransform({translate3d: o});
	},
	// when stopped, we use scrollLeft/Top (makes cursor positioning automagic)
	effectScrollStop: function() {
		this.effectTransform({translate3d: "0, 0, 0"});
		this.setScrollLeft(this.scrollLeft);
		this.setScrollTop(this.scrollTop);
	},
	down: enyo.nop
});
