enyo.kind({
	name: "enyo.SlidingFitPanels",
	kind: "SlidingPanels",
	className: "enyo-sliding-fit-panels",
	layoutKind: "HLayout", 
	addPanel: function(inPanel) {
		this.inherited(arguments);
		inPanel.unit = "%";
	},
	flowSliding: function() {
		var d = this.axis == "v" ? "height" : "width";
		var b = this.collapsesToEnd ? this.panels.length-1 : 0;
		var m = this.collapsesToEnd ? "max" : "min";
		for (var i=b, s=0, p; p=this.panels[i]; this.collapsesToEnd ? i-- : i++) {
			// set range
			p[m] = p._range[m] || s;
			s += Number(p._range[m] || 100 * this.collapseSign) || 0;
			// set z-index
			if (this.collapsesToEnd) {
				p.applyStyle("z-index", this.panels.length - i - 1);
			}
		}
	},
	rendered: function() {
		this.inherited(arguments);
		this.adjustPanelDragging();
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.adjustPanelDragging();
	},
	adjustPanelDragging: function() {
		var d = this.axis == "v" ? "height" : "width";
		for (var i=0, s, p; p=this.panels[i]; i++) {
			s = p.getBounds()[d];
			if (s) {
				p.kDragScalar = 100 / s;
			}
		}
	},
	fitPanel: function(inPanel) {}
});
