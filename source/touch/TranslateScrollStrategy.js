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
	},
	maxHeightChanged: function() {
		this.inherited(arguments);
		this.$.clientContainer.addRemoveClass("enyo-fit", !this.maxHeight);
	},
	shouldDrag: function(inSender, inEvent) {
		// stop and update drag info before checking drag status
		this.stop();
		this.calcStartInfo();
		return this.inherited(arguments);
	},
	scrollMathStart: function(inSender) {
		this.inherited(arguments);
		this.scrollStarting = true;
	},
	scrollMathScroll: function(inSender) {
		this.scrollLeft = -inSender.x;
		this.scrollTop = -inSender.y;
		if (this.isScrolling()) {
			// reset dom scroll position when starting to scroll and use transforms
			if (this.scrollStarting && this.scrollNode) {
				this.scrollStarting = false;
				this.scrollNode.scrollTop = this.scrollNode.scrollLeft = 0;
			}
			this.effectScroll(-this.scrollLeft, -this.scrollTop);
			if (this.thumb) {
				this.updateThumbs();
			}
		}
		this.doScroll(inSender);
	},
	// while moving, scroller uses translate
	effectScroll: function(inX, inY) {
		var o = inX + "px, " + inY + "px" + (this.accel ? ",0" : "");
		enyo.dom.transformValue(this.$.client, this.translation, o);
	},
	// when stopped, we use scrollLeft/Top (makes cursor positioning automagic)
	effectScrollStop: function() {
		var t = "0,0" + (this.accel ? ",0" : "");
		enyo.dom.transformValue(this.$.client, this.translation, t);
		this.setScrollLeft(this.scrollLeft);
		this.setScrollTop(this.scrollTop);
	},
	down: enyo.nop
});
