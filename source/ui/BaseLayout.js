enyo.kind({
	name: "enyo.BaseLayout",
	kind: enyo.Layout,
	constructor: function(inContainer) {
		this.inherited(arguments);
		inContainer.applyStyle("position", "relative");
	},
	reflow: function() {
		enyo.forEach(this.container.children, function(c) {
			if (c.fit !== null) {
				c.addRemoveClass("enyo-fit", c.fit);
			}
		}, this);
	}
});

//enyo.Control.prototype.layoutKind = "enyo.BaseLayout";