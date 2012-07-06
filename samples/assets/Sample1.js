enyo.kind({
	name: "Sample",
	kind: "Control",
	components: [
		{name: "input", tag: "input"},
		{tag: "br"},
		{name: "button", tag: "button", content: "Set Content", ontap: "buttonTap"},
		{tag: "br"},
		{name: "output", classes: "sample-output"}
	],
	buttonTap: function(inSender, inEvent) {
		var value = this.$.input.hasNode().value;
		this.$.output.setContent(value);
	}
});