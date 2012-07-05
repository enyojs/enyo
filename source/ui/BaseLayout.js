/**
	BaseLayout provides a basic layout strategy, positioning contained components with the "enyo-positioned" layoutClass.
	Additionally it will adjust the layout when reflow is called, removing or adding the enyo-fit class for components
	that have set the "fit" property.
*/
enyo.kind({
	name: "enyo.BaseLayout",
	kind: enyo.Layout,
	layoutClass: "enyo-positioned",
	reflow: function() {
		enyo.forEach(this.container.children, function(c) {
			if (c.fit !== null) {
				c.addRemoveClass("enyo-fit", c.fit);
			}
		}, this);
	}
});

//enyo.Control.prototype.layoutKind = "enyo.BaseLayout";