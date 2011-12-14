/**
A drawer with its content styled to look like a divider. An arrow button shows the open state of the drawer.

A content and an icon for the content may be provided.
*/
enyo.kind({
	name: "enyo.DividerDrawer",
	kind: enyo.Drawer,
	published: {
		/**
		URL for an image to be used as the icon.
		*/
		icon: "",
		content: ""
	},
	//* @protected
	components: [
		{name: "content", kind: "enyo.Divider", onclick: "toggleOpen", components: [
			{name: "openButton", kind: "enyo.SwitchedButton", className: "enyo-collapsible-arrow"}
		]},
		{name: "client", kind: "enyo.BasicDrawer", onOpenChanged: "doOpenChanged", onOpenAnimationComplete: "doOpenAnimationComplete"}
	],
	create: function() {
		this.inherited(arguments);
		this.iconChanged();
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
		this.$.content.applyStyle("display", this.content ? "" : "none");
	},
	openChanged: function() {
		this.inherited(arguments);
		this.$.openButton.setSwitched(!this.open);
	},
	iconChanged: function() {
		this.$.content.setIcon(this.icon);
	}
});