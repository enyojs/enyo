enyo.kind({
	name: "SimpleScroller",
	kind: "Control",
	className: "simple-scroller",
	preventDragPropagation: true,
	dragstartHandler: function() {
		this.x0 = this.hasNode().scrollLeft;
		this.y0 = this.hasNode().scrollTop;
		return this.preventDragPropagation;
	},
	dragHandler: function(inSender, inEvent) {
		this.hasNode().scrollLeft = this.x0 - inEvent.dx;
		this.hasNode().scrollTop = this.y0 - inEvent.dy;
	},
	dragfinishHandler: function(inSender, inEvent) {
		this.preventClick = true;
	},
	// FIXME: hacky way to squelch click when there is a drag
	captureDomEvent: function(e) {
		if (e.type == "click") {
			var r = this.preventClick;
			this.preventClick = false;
			return r;
		}
	}
});