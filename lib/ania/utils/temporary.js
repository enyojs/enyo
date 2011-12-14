enyo._$L = $L = function(inText) {
	return inText;
}

enyo.calcModalControlBounds = function(inControl) {
	var o = enyo.mixin(inControl.getBounds(), inControl.getOffset());
	var oh = o.top + o.height;
	var vh = enyo.getModalBounds().height;
	o.height -= Math.max(0, oh - vh);
	return o;
}

// return visible bounds of window unobscured by content like maybe a keyboard...
enyo.getModalBounds = function() {
	return {
		width: window.innerWidth,
		height: window.innerHeight
	};
}

enyo.mixin(enyo.Control.prototype, {
	// FIXME: used for StateManager to discover properties to statify...
	getPublishedList: function() {
		return this.ctor.publishedList || this.makePublishedList();
	},
	makePublishedList: function() {
		var props = {showing: "", className: "", content: ""};
		var proto = this.ctor.prototype;
		var p = proto;
		while (p && (p != enyo.Control.prototype)) {
			enyo.mixin(props, p.published);
			p = p.base && p.base.prototype;
		}
		return this.ctor.publishedList = props;
	},
	// FIXME: enyo.Picker was first to need this
	getOffset: function() {
		if (this.parent) {
			return this.parent.calcControlOffset(this);
		} else {
			return enyo.dom.calcNodeOffset(this.hasNode());
		}
	},
	calcControlOffset: function(inControl) {
		var p = inControl.parent;
		if (p && p != this) {
			return p.calcControlOffset(inControl);
		} else {
			var o = this.getOffset();
			if (this.hasNode() && inControl.hasNode()) {
				var c = enyo.dom.calcNodeOffset(inControl.node, this.node);
				o.top += c.top;
				o.left += c.left;
			}
			return o;
		}
	}
});

//* @public
enyo.mixin(enyo.dom, {
	//* Get the calculated border of a node
	calcBorderExtents: function(inNode) {
		var s = this.getComputedStyle(inNode, null);
		return s && {
			t: parseInt(s.getPropertyValue("border-top-width")),
			r: parseInt(s.getPropertyValue("border-right-width")),
			b: parseInt(s.getPropertyValue("border-bottom-width")),
			l: parseInt(s.getPropertyValue("border-left-width"))
		};
	},
	//* Get the calculated margin of a node
	calcMarginExtents: function(inNode) {
		var s = this.getComputedStyle(inNode, null);
		return s && {
			t: parseInt(s.getPropertyValue("margin-top")),
			r: parseInt(s.getPropertyValue("margin-right")),
			b: parseInt(s.getPropertyValue("margin-bottom")),
			l: parseInt(s.getPropertyValue("margin-left"))
		};
	},
	/*
	Calculate the offset of inNode relative to viewport or the optional inParentNode.
	This offset includes any all webkit-transform and scroll positioning.
	*/
	calcNodeOffset: function(inNode, inParentNode) {
		var b = inNode && inNode.getBoundingClientRect();
		// bounding rect is readonly
		b = b ? {top: b.top, right: b.right, bottom: b.bottom, left: b.left} : {};
		if (inParentNode) {
			var p = inParentNode && inParentNode.getBoundingClientRect();
			if (p) {
				b.left -= p.left;
				b.right -= p.left;
				b.top -= p.top;
				b.bottom -= p.top;
			}
		}
		return b;
	}
});


// return the control associated with the given node
enyo.findControlForNode = function(inNode) {
	var t, n = inNode;
	// FIXME: Mozilla: try/catch is here to squelch "Permission denied to access property xxx from a non-chrome context" 
	// which appears to happen for scrollbar nodes in particular. It's unclear why those nodes are valid targets if 
	// it is illegal to interrogate them. Would like to trap the bad nodes explicitly rather than using an exception block.
	try {
		while (n) {
			if (t = enyo.$[n.id]) {
				break;
			}
			n = n.parentNode;
		}
	} catch(x) {
		console.log(x, n);
	}
	return t;
}

// return the control associated with the focused node
enyo.findFocusedControl = function() {
	return enyo.findControlForNode(document.activeElement);
}