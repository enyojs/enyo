/**
	_enyo.BaseLayout_ provides a basic layout strategy, positioning contained
	components with the _enyo-positioned_ layoutClass. In addition, it adjusts
	the layout when _reflow_ is called, removing or adding the _enyo-fit_ class
	for components that have set the _fit_ property.
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