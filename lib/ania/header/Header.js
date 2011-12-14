/**
A control styled as a header fitting across the top of the application region.

Content for Header can be specified either via the content property or by placing
components in the Header. For example,

	{kind: "Header", content: "Header"}

or

	{kind: "Header", components: [
		{content: "Header", flex: 1},
		{kind: "Button", content: "Right-aligned button"}
	]}
*/
enyo.kind({
	name: "enyo.Header",
	kind: enyo.Control,
	layoutKind: "HFlexLayout", 
	className: "enyo-header",
	components: [
		{name: "client", flex: 1, align: "center", className: "enyo-header-inner"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.layout = new enyo.HFlexLayout();
	},
	// FIXME: do we want a more general system for promoting layoutKind and content to client?
	layoutKindChanged: function() {
		if (this.align) {
			this.$.client.align = this.align;
		}
		if (this.pack) {
			this.$.client.pack = this.pack;
		}
		this.$.client.setLayoutKind(this.layoutKind);
	},
	contentChanged: function() {
		this.$.client.setContent(this.content);
	}
});
