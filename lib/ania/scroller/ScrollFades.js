/**
	A scroller that provides a visual indication if content can be scrolled 
	to the left, right, top, or bottom.
*/
enyo.kind({
	name: "enyo.ScrollFades", 
	kind: enyo.Control,
	//* @protected
	className: "enyo-view",
	topFadeClassName: "enyo-scrollfades-top",
	bottomFadeClassName: "enyo-scrollfades-bottom",
	leftFadeClassName: "enyo-scrollfades-left",
	rightFadeClassName: "enyo-scrollfades-right",
	create: function() {
		this.inherited(arguments);
		this.createFade("top");
		this.createFade("bottom");
		this.createFade("left");
		this.createFade("right");
	},
	createFade: function(inFadePos) {
		var f = this[inFadePos + "FadeClassName"];
		if (f) {
			this.createComponent({name: inFadePos, showing: false, className: f});
		}
	},
	//* @public
	/**
	 Given a scroller, this method will show or hide scroll fades based
	 on the scroller's scroll position and boundaries.
	 */
	showHideFades: function(inScroller) {
		var t = inScroller.scrollTop;
		var l = inScroller.scrollLeft;
		var bs = inScroller.getBoundaries();
		this.$.top && this.$.top.setShowing(inScroller.vertical && t > bs.top);
		this.$.bottom && this.$.bottom.setShowing(inScroller.vertical && t < bs.bottom);
		this.$.left && this.$.left.setShowing(inScroller.horizontal && l > bs.left);
		this.$.right && this.$.right.setShowing(inScroller.horizontal && l < bs.right);
	}
});
