// Facilitates ordered styling by adding first, last, single, middle classes.
//* @protected
enyo.kind({
	name: "enyo.OrderedLayout",
	//* @protected
	destroy: function() {},
	getShowingChildren: function(inContainer) {
		var r = [];
		for (var i=0, c$ = inContainer.children, c; c=c$[i]; i++) {
			if (c.showing) {
				r.push(c);
			}
		}
		return r;
	},
	flow: function(inContainer) {
		var c$ = this.getShowingChildren(inContainer);
		var l = c$.length;
		for (var i=0, c, r; c=c$[i]; i++) {
			r = l === 1 ? "single" : (i === 0 ? "first" : (i === l-1 ? "last" : "middle"));
			this.styleChild(c, "enyo-" + r);
		}
	},
	styleChild: function(inChild, inOrderStyle) {
		if (inChild.setOrderStyle) {
			inChild.setOrderStyle(inOrderStyle);
		} else {
			this.defaultStyleChild(inChild, inOrderStyle);
		}
	},
	defaultStyleChild: function(inChild, inOrderStyle) {
		var t = inChild._orderStyle;
		if (t) {
			inChild.removeClass(t);
		}
		inChild.addClass(inOrderStyle);
		inChild._orderStyle = inOrderStyle;
	}
});