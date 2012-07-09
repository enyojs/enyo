enyo.kind({
	name: "Sample",
	kind: "Control",
	components: [
		{content: "Create a button control with the given content:", style: "padding: 10px 0;"},
		{name: "input", tag: "input", attributes: {value: "Foo"}, style: "display: block;"},
		{style: "padding: 10px 0;", components: [
			{tag: "button", style: "margin-right: 10px;", content: "Add", ontap: "addTap"},
			{tag: "button", content: "Clear", ontap: "clearTap"},
		]},
		{name: "output"}
	],
	addTap: function(inSender, inEvent) {
		var content = this.$.input.hasNode().value;
		this.createComponent({
			tag: "button",
			content: content,
			container: this.$.output
		}).render();
	},
	clearTap: function(inSender, inEvent) {
		this.$.output.destroyClientControls();
	}
});