/**
A control primitive that applies ordering CSS classes to its contents:
enyo-first, enyo-middle, and enyo-last or enyo-single.

This can help facilitate CSS styling in cases where the styling of the first and last controls
differs from that of the middle controls. This occurs, for example, when the top and bottom controls
in a group have rounded corners but the middle controls do not.

	{kind: "OrderedContainer", components: [
		{name: "first", content: "first"},
		{name: "middle", content: "middle"},
		{name: "last", content: "last"}
	]}

The above code produces a control named first with CSS class enyo-first, a control
named middle with CSS class enyo-middle, and a control named last with CSS class
enyo-last.
*/
enyo.kind({
	name: "enyo.OrderedContainer",
	kind: enyo.Control,
	layoutKind: "HFlexLayout",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.orderedLayout = new enyo.OrderedLayout(this);
	},
	flow: function() {
		this.orderedLayout.flow(this);
		this.inherited(arguments);
	}
});