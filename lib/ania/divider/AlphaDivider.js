/**
A divider designed to show a single letter as its content. For example:

	{kind: "AlphaDivider", content: "S"}

*/
enyo.kind({
	name: "enyo.AlphaDivider",
	kind: enyo.Control,
	className: "enyo-divider-alpha",
	components: [
		{name: "content", className: "enyo-divider-alpha-content"}
	],
	//* @protected
	contentChanged: function() {
		this.$.content.setContent(this.content);
	}
});
