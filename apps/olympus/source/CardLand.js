enyo.kind({
	name: "CardLand",
	kind: "CarouselPanels",
	preventDragPropagation: true,
	layoutKind: "HBoxLayout",
	addControl: function(inControl) {
		inControl.width = this.getBounds().width;
		this.inherited(arguments);
	},
	refresh: function() {
		this.inherited(arguments);
		this.flow();
	},
	applyValue: function(inValue) {
		for (var i=0, c$=this.getClientControls(), s, c; c=c$[i]; i++) {
			if (c.hasNode()) {
				c.hasNode().style.marginLeft = (inValue || 0) + "px";
			}
		}
	},
	calcValueForIndex: function(inIndex) {
		var cs = this.getClientControls();
		var c = cs[inIndex] || cs[cs.length && cs.length-1];
		if (c && c.hasNode()) {
			return -c.hasNode().style.left.replace("px", "");
		}
	}
});
