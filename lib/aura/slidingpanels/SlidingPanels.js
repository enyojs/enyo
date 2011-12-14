enyo.kind({
	name: "enyo.SlidingPanels",
	kind: "Panels",
	layoutKind: "HBoxLayout", 
	className: "enyo-sliding-panels",
	defaultKind: "SlidingPanel",
	published: {
		// direction this group collapses to: start, end
		collapsesToEnd: true,
		axis: null
	},
	create: function() {
		this.inherited(arguments);
		this.created = true;
		this.collapsesToEndChanged();
	},
	importProps: function() {
		this.inherited(arguments);
		if (!this.axis) {
			this.axis = this.layoutKind == "HBoxLayout" || this.layoutKind == "HLayout" ? "h" : "v";
		}
	},
	addPanel: function(inPanel) {
		this.inherited(arguments);
		inPanel.overDragging = false;
		inPanel.axis = this.axis;
		inPanel._range = {min: inPanel.min, max: inPanel.max};
		if (this.created) {
			this.flowSliding();
			var y = this.findCollapseYounger(inPanel);
			if (y) {
				inPanel.setValue(y.getValue());
			}
		}
	},
	flow: function() {
		this.inherited(arguments);
		this.flowSliding();
	},
	// auto-sets ranges and z-index
	flowSliding: function() {
		var d = this.axis == "v" ? "height" : "width";
		var b = this.collapsesToEnd ? this.panels.length-1 : 0;
		var m = this.collapsesToEnd ? "max" : "min";
		for (var i=b, s=0, p; p=this.panels[i]; this.collapsesToEnd ? i-- : i++) {
			// set range
			p[m] = p._range[m] || s;
			s += Number(p[m] || p[d] * this.collapseSign) || 0;
			// set z-index
			if (this.collapsesToEnd) {
				p.applyStyle("z-index", this.panels.length - i - 1);
			}
		}
	},
	collapsesToEndChanged: function() {
		this.collapseSign = this.collapsesToEnd ? 1 : -1;
	},
	calcPanelCollapse: function(inPanel) {
		return this.collapsesToEnd ? inPanel.calcMax() : inPanel.calcMin();
	},
	isPanelAtCollapse: function(inPanel) {
		return this.collapsesToEnd ? inPanel.isAtMax() : inPanel.isAtMin();
	},
	panelFinishAnimate: function(inPanel) {
		var d = this.axis == "v" ? "height" : "width";
		if (inPanel[d] == "fill") {
			this.fitPanel(inPanel);
		}
		this.delayHidePanels();
	},
	cancelDelayHidePanels: function() {
		if (this.hideJob) {
			clearTimeout(this.hideJob);
		}
	},
	delayHidePanels: function() {
		this.cancelDelayHidePanels();
		this.hideJob = setTimeout(enyo.bind(this, "hidePanels"), 100);
	},
	// FIXME: need a better way of determining if a 
	// panel is showing and not duplicating messages
	hidePanels: function() {
		var b = this.collapsesToEnd ? 0 : this.panels.length-1;
		for (var i = b, s=0, h=false, p; p=this.panels[i]; this.collapsesToEnd ? i++ : i--) {
			if (h) {
				this.handlePanelHidden(p);
			}
			if (this.isPanelAtCollapse(p)) {
				h = true;
			}
		}
	},
	panelDrag: function(inPanel, inDelta) {
		for (var i=0, p; p=this.panels[i]; i++) {
			if (p != inPanel) {
				this.siblingPanelDrag(p, inDelta);
			}
		}
	},
	siblingPanelDrag: function(inPanel, inDelta) {
		if (this.shouldPanelDrag(inPanel, inDelta)) {
			var v = inDelta + inPanel.value;
			v = inPanel.clampValue(v);
			//this.log(inPanel.id, inDelta, inPanel.value, v);
			inPanel.setValue(v);
		}
	},
	shouldPanelDrag: function(inPanel, inDelta) {
		// always if collapsing
		if (inDelta * this.collapseSign > 0) {
			return true;
		// or if 'older' is moving or 'younger' is dragging
		} else {
			return this.isElderMoving(inPanel) || this.isYoungerDragging(inPanel);
		}
	},
	isElderMoving: function(inPanel) {
		var s = this.findCollapseElder(inPanel);
		return s && Math.abs(s.value) <= Math.abs(this.calcPanelCollapse(inPanel));
	},
	isYoungerDragging: function(inPanel) {
		s = inPanel;
		while (s = this.findCollapseYounger(s)) {
			if (s.dragging) {
				return true;
			}
		}
	},
	dragstartHandler: function(inSender) {
		for (var i=0, p; p=this.panels[i]; i++) {
			this.handlePanelShown(p);
		}
		return this.preventDragPropagation;
	},
	panelCompleteDrag: function(inPanel, inMinimizing) {
		var p = this.findCollapsingSibling(inPanel);
		var collapse = inMinimizing && !this.collapsesToEnd || !inMinimizing && this.collapsesToEnd;
		if (!collapse) {
			p = this.findCollapseYounger(p)
		}
		if (p) {
			this.animateToCollapse(p);
		}
		return true;
	},
	findCollapseElder: function(inPanel) {
		return this.findSibling(inPanel, -this.collapseSign);
	},
	findCollapseYounger: function(inPanel) {
		return this.findSibling(inPanel, this.collapseSign);
	},
	findCollapsingSibling: function(inPanel) {
		var b = this.collapsesToEnd ? this.panels.length-1 : 0;
		for (var i = b, p; p=this.panels[i]; this.collapsesToEnd ? i-- : i++) {
			if (!this.isPanelAtCollapse(p)) {
				return p;
			}
		}
	},
	findSibling: function(inPanel, inDelta) {
		var i = enyo.indexOf(inPanel, this.panels);
		var c$ = this.panels;
		var c = c$[i + inDelta];
		return c;
	},
	animateToCollapse: function(inPanel) {
		var c = this.calcPanelCollapse(inPanel);
		var m = this.collapsesToEnd ? "min" : "max";
		for (var i=0, p, v; p=this.panels[i]; i++) {
			v = Math[m](c, this.calcPanelCollapse(p));
			//this.log(p.id, v);
			p.animateTo(v);
		}
	},
	expandAll: function() {
		var p = this.panels[this.collapsesToEnd ? this.panels.length-1 : 0];
		this.animateToCollapse(p);
	},
	fitPanel: function(inPanel) {
		var b = this.collapsesToEnd ? {v: "top", h: "left"} : {v: "bottom", h: "right"};
		var d = b[this.axis];
		inPanel.applyStyle(this.axis == "v" ? "height" : "width", null);
		inPanel.applyStyle(d, -this.collapseSign * inPanel.value + "px");
	}
});
