/**
enyo.TranslateScrollStrategy is a helper kind that extends <a href="#enyo.TouchScrollStrategy">enyo.TouchScrollStrategy</a> 
to be optimized for scrolling environments in which effecting scroll changes with transform is fastest.

enyo.TranslateScrollStrategy is not typically created in application code.
*/
enyo.kind({
	name: "enyo.TranslateScrollStrategy",
	kind: "TouchScrollStrategy",
	components: [
		{name: "clientContainer", classes: "enyo-touch-scroller", attributes: {"onscroll": enyo.bubbler}, components: [
			{name: "client"}
		]}
	],
	//* Set to true to optimize the strategy to only use translation to scroll; this increases fluidity of
	//* scrolling animation. It should not be used when the scroller contains controls that require keyboard
	//* input. This is because when translateOptimized, it is possible to position inputs such that 
	//* they will not become visibile when focused.
	translateOptimized: false,
	getScrollSize: function() {
		var n = this.$.client.hasNode();
		return {width: n ? n.scrollWidth : 0, height: n ? n.scrollHeight : 0};
	},
	create: function() {
		this.inherited(arguments);
		// apply initial transform so we're always composited
		enyo.dom.transformValue(this.$.client, this.translation, "0,0,0");
	},
	calcScrollNode: function() {
		return this.$.clientContainer.hasNode();
	},
	maxHeightChanged: function() {
		// content should cover scroller at a minimum if there's no max-height.
		this.$.client.applyStyle("min-height", this.maxHeight ? null : "100%");
		this.$.client.applyStyle("max-height", this.maxHeight);
		this.$.clientContainer.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
	},
	shouldDrag: function(inSender, inEvent) {
		// stop and update drag info before checking drag status
		this.stop();
		this.calcStartInfo();
		return this.inherited(arguments);
	},
	syncScrollMath: function() {
		if (!this.translateOptimized) {
			this.inherited(arguments);
		}
	},
	setScrollLeft: function(inLeft) {
		this.stop();
		if (this.translateOptimized) {
			var m = this.$.scrollMath;
			m.setScrollX(-inLeft);
			m.stabilize();
		} else {
			this.inherited(arguments);
		}
	},
	setScrollTop: function(inTop) {
		this.stop();
		if (this.translateOptimized) {
			var m = this.$.scrollMath;
			m.setScrollY(-inTop);
			m.stabilize();
		} else {
			this.inherited(arguments);
		}
	},
	getScrollLeft: function() {
		return this.translateOptimized ? this.scrollLeft: this.inherited(arguments);
	},
	getScrollTop: function() {
		return this.translateOptimized ? this.scrollTop : this.inherited(arguments);
	},
	scrollMathStart: function(inSender) {
		this.inherited(arguments);
		this.scrollStarting = true;
		this.startX = 0;
		this.startY = 0;
		if (!this.translateOptimized && this.scrollNode) {
			this.startX = this.getScrollLeft();
			this.startY = this.getScrollTop();
		}
	},
	scrollMathScroll: function(inSender) {
		this.scrollLeft = -inSender.x;
		this.scrollTop = -inSender.y;
		if (this.isScrolling()) {
			if (this.$.scrollMath.isScrolling()) {
				this.effectScroll(this.startX - this.scrollLeft, this.startY - this.scrollTop);
			}
			if (this.thumb) {
				this.updateThumbs();
			}
		}
	},
	// while moving, scroller uses translate
	effectScroll: function(inX, inY) {
		var o = inX + "px, " + inY + "px" + (this.accel ? ",0" : "");
		enyo.dom.transformValue(this.$.client, this.translation, o);
	},
	// when stopped, we use scrollLeft/Top (makes cursor positioning automagic)
	effectScrollStop: function() {
		if (!this.translateOptimized) {
			var t = "0,0" + (this.accel ? ",0" : "");
			// FIXME: normally translate3d changes not effect scrollHeight; however
			// there appear to be some dom changes (e.g. showing a node inside the scroller, 
			// which do cause the scrollHeight to be changed from the translate3d.
			// In this case setting the translate3d back to 0 does not restore scrollHeight.
			// This causes a problem because setting scrollTop can produced an unexpected result if 
			// scrollHeight is less than expected.
			// We detect this fault by validating scroll bounds and (1) un-apply the translate3d,
			// (2) update scrollTop/Left, and (3) re-apply a 0,0,0 translate3d to ensure compositing.
			// Luckily this corrects the problem (which appears to be a webkit bug). Note that 
			// it's important to maintain a composited state (translate3d 0,0,0) or Android 4 is 
			// slow to start scrolling.
			var m = this.$.scrollMath, sb = this._getScrollBounds();
			var needsBoundsFix = Boolean((sb.maxTop + m.bottomBoundary) || (sb.maxLeft + m.rightBoundary));
			enyo.dom.transformValue(this.$.client, this.translation, needsBoundsFix ? null : t);
			// note: this asynchronously triggers dom scroll event
			this.setScrollLeft(this.scrollLeft);
			this.setScrollTop(this.scrollTop);
			if (needsBoundsFix) {
				enyo.dom.transformValue(this.$.client, this.translation, t);
			}
		}
	},
	down: enyo.nop
});
