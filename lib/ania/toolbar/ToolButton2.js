/**
	A button styled to go in a
	<a href="#enyo.Toolbar">Toolbar</a> with an icon in the center.

		{kind: "ToolButton", icon: "images/foo.png"}
*/

// ToolButton has a tap target larger than area styled as a button.
enyo.kind({
	name: "enyo.ToolButton2", 
	kind: enyo.IconButton2,
	clientComponents: [
		{name: "client", layoutKind: "HFlexLayout", align: "center", className: "enyo-tool-button-client"}
	],
	// do not style this as a button
	className: "enyo-tool-button",
	contentClassName: "enyo-tool-button-content",
	initComponents: function() {
		this.createComponents(this.clientComponents);
		this.inherited(arguments);
	},
	//* @protected
	contentChanged: function() {
		this.inherited(arguments);
		this.$.client.addRemoveClass(this.contentClassName, Boolean(this.content));
	},
	setState: function(inState, inValue) {
		this.$.client.addRemoveClass(this.cssNamespace + "-" + inState, Boolean(inValue));
	}
});
