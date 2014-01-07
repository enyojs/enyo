enyo.kind({
	name: "enyo.sample.TextAreaSample",
	classes: "text-area-sample",
	components: [
		{tag: "label", content: "Text Area", classes: "section", attributes: [{"for": "inputTextArea"}]},
		{kind: "enyo.TextArea", name: "inputTextArea", type: "text", placeholder: "TextArea", value: "Initial TextArea Value", onchange: "inputChanged", oninput: "inputOccurred"},
		{tag: "label", content: "Disabled Text Area", classes: "section", attributes: [{"for": "textAreaDisabled"}]},
		{kind: "enyo.TextArea", name: "textAreaDisabled", disabled: true, value: "Disabled", onchange: "inputChanged", oninput: "inputOccurred"},
		{kind: "enyo.Button", name: "buttonTextAreaToggle", ontap: "buttonTextAreaToggleTapped", content: "Toggle Text Area State"},
		{name: "results", classes: "results"}
	],
	inputChanged: function(inSender, inEvent) {
		this.$.results.setContent("The value of \"" + inSender.getName() + "\" has been changed to: \"" + inSender.getValue() + "\".");
	},
	inputOccurred: function(inSender, inEvent) {
		this.$.results.setContent("The current value of \"" + inSender.getName() + "\" is: \"" + inSender.getValue() + "\".");
	},
	buttonTextAreaToggleTapped: function(inSender, inEvent) {
		this.$.textAreaDisabled.setDisabled(!this.$.textAreaDisabled.getDisabled()).setValue(this.$.textAreaDisabled.getDisabled() ? "Disabled" : "Enabled");
		this.$.results.setContent("The current state of \"textAreaDisabled\" is \"" + (this.$.textAreaDisabled.getDisabled() ? "disabled" : "enabled") + "\".");
	}
});