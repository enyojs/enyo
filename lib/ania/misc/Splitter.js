enyo.kind({
	name: "enyo.Splitter",
	kind: enyo.Control,
	published: {
		direction: "left" // left, right, up, down
	},
	events: {
		onResizing: "",
		onResized: ""
	},
	draggable: true,
	size: 8,
	//style: "background-color: lightblue; cursor: move;",
	style: "cursor: move; border: 1px solid; border-color: gray #EEE #EEE gray;",
	create: function() {
		this.inherited(arguments);
		this.directionChanged();
	},
	directionChanged: function() {
		this.delta = (this.direction == "right") || (this.direction == "down") ? -1 : 1;
		var upDown = (this.direction == "up" || this.direction == "down");
		this.axis = upDown ? "height" : "width";
		this.offAxis = upDown ? "width" : "height";
		this.dragAxis = upDown ? "dy" : "dx";
		this.applyStyle("border-width", upDown ? "1px 0 1px 0" : "0 1px 0 1px");
		//this.applyStyle("margin", upDown ? "7px 0 7px 0" : "0 7px 0 7px");
		this.applyStyle(this.offAxis, "100%");
		this.applyStyle(this.axis, this.size + "px");
	},
	rendered: function() {
		this.inherited(arguments);
		this.sizeable = this.findSizeable();
	},
	findSizeable: function() {
		var i = this.parent.indexOfChild(this) - this.delta;
		var c$ = this.parent.children;
		for (var c; (c=c$[i]); i+=d) {
			if (c.showing) {
				return c;
			}
		}
	},
	dragstartHandler: function(inSender, inEvent) {
		this._startPosition = this.sizeable.getBounds()[this.axis];
		return true;
	},
	dragHandler: function(inSender, inEvent) {
		var v = this._startPosition + inEvent[this.dragAxis] * this.delta;
		v = Math.min(this.maxSize || 1e5, Math.max(this.minSize || 0, v));
		this.sizeable.applyStyle(this.axis, v + "px");
		this.parent.resized();
		this.doResizing();
		return true;
	},
	dragfinishHandler: function() {
		this.parent.resized();
		this.doResized();
	}
});