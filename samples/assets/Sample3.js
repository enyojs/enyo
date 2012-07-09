enyo.kind({
	name: "Sample",
	kind: "Control",
	components: [
		{name: "input", tag: "input", attributes: {value: "Foo "}},
		{tag: "br"},
		{tag: "button", content: "Add Content", ontap: "addContentTap"},
		{tag: "br"},
		{tag: "button", style: "margin-right: .5em;", content: "Hide", ontap: "hideTap"},
		{tag: "button", style: "margin-right: .5em;", content: "Show", ontap: "showTap"},
		{tag: "button", content: "Toggle class", ontap: "toggleClassTap"},
		{tag: "br"},
		{name: "output", classes: "sample-output"}
	],
	addContentTap: function(inSender, inEvent) {
		var content = this.$.input.hasNode().value;
		this.$.output.addContent(content);
	},
	hideTap: function(inSender, inEvent) {
		this.$.output.hide();
	},
	showTap: function(inSender, inEvent) {
		this.$.output.show();
	},
	toggleClassTap: function(inSender, inEvent) {
		var c = "sample-output";
		var has = this.$.output.hasClass(c);
		this.$.output.addRemoveClass(c, !has);
	}
});