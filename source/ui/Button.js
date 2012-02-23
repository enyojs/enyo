enyo.kind({
	name: "enyo.Button",
	kind: enyo.ToolDecorator,
	tag: "Button",
	tap: function() {
		this.setActive(true);
	}
});
