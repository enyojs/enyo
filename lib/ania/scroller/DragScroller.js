/**
enyo.DragScroller is a base kind that integrates the scrolling simulation provided
by <a href="#enyo.ScrollStrategy">enyo.ScrollStrategy</a>
into a Control</a>.

enyo.ScrollStrategy is not typically created in application code.
*/
enyo.kind({
	name: "enyo.DragScroller",
	kind: enyo.Control,
	/**
		If true, the scroller will not propagate dragstart events that cause it to start scrolling (defaults to true)
	*/
	preventDragPropagation: true,
	published: {
		/**
		Set to false to prevent horizontal scrolling.
		*/
		horizontal: true,
		/**
		Set to false to prevent vertical scrolling.
		*/
		vertical: true
	},
	//* @protected
	tools: [
		{name: "scroll", kind: "ScrollStrategy"}
	],
	create: function() {
		this.inherited(arguments);
		this.horizontalChanged();
		this.verticalChanged();
	},
	initComponents: function() {
		this.createComponents(this.tools);
		this.inherited(arguments);
	},
	horizontalChanged: function() {
		this.$.scroll.setHorizontal(this.horizontal);
	},
	verticalChanged: function() {
		this.$.scroll.setVertical(this.vertical);
	},
	shouldDrag: function(e) {
		var requestV = e.vertical;
		// FIXME: auto* are not part of this class
		// FIXME: whether an autoHorizontal scroller will actually 
		// require horizontal scrolling is not known at this point
		// which can be repaired with some refactoring.
		var canH = this.horizontal;
		var canV = this.vertical;
		return requestV && canV || !requestV && canH;
	},
	flickHandler: function(inSender, e) {
		var onAxis = Math.abs(e.xVel) > Math.abs(e.yVel) ? this.horizontal : this.vertical;
		if (onAxis) {
			this.$.scroll.flick(e);
			return this.preventDragPropagation;
		}
	},
	mouseholdHandler: function(inSender, e) {
		if (this.$.scroll.isScrolling() && !this.$.scroll.isInOverScroll()) {
			this.$.scroll.stop(e);
			return true;
		}
	},
	// special synthetic DOM events served up by the Gesture system
	dragstartHandler: function(inSender, inEvent) {
		this.dragging = this.shouldDrag(inEvent);
		if (this.dragging) {
			this.$.scroll.startDrag(inEvent);
			if (this.preventDragPropagation) {
				return true;
			}
		}
	},
	dragHandler: function(inSender, inEvent) {
		if (this.dragging) {
			this.$.scroll.drag(inEvent);
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventClick();
			this.$.scroll.dragDrop(inEvent);
			this.$.scroll.dragFinish();
			this.dragging = false;
		}
	},
	mousewheelHandler: function(inSender, e) {
		if (!this.dragging && this.$.scroll.mousewheel(e)) {
			e.preventDefault();
			return true;
		}
	}
});
