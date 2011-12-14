/**
	Slides vertically or horizontally between a min/max value using transform to animate quickly.
*/
enyo.kind({
	name: "enyo.SlidingPanel",
	kind: enyo.Transformer,
	className: "enyo-sliding-panel",
	published: {
		// seems more convenient to use axis 
		// instead of transform (sets to translateX/Y)
		axis: "h"
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.axisChanged();
	},
	axisChanged: function() {
		var p = this.axis == "h" ? "translateX" : "translateY";
		this.setTransform(p);
	},
	transformChanged: function() {
		this.inherited(arguments);
		this.dragEventProp = this.transform == "translateX" ? "dx" : "dy";
	},
	shouldDrag: function(inEvent) {
		return this.inherited(arguments) && inEvent[this.axis == "h" ? "horizontal" : "vertical"];
	},
	applyDrag: function(inDelta) {
		if (!this.dispatch(this.container, "panelDrag", [inDelta])) {
			this.inherited(arguments);
		}
	},
	completeDrag: function(inDragMinimizing) {
		if (!this.dispatch(this.container, "panelCompleteDrag", [inDragMinimizing])) {
			this.inherited(arguments);
		}
	},
	finishAnimate: function(inSender) {
		if (!this.dispatch(this.container, "panelFinishAnimate")) {
			this.inherited(arguments);
		}
	},
	hiddenHandler: function(inSender) {
		//this.applyStyle("opacity", "0.5");
	},
	shownHandler: function(inSender) {
		//this.applyStyle("opacity", "1");
	}
});