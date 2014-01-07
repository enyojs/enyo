enyo.kind({
	name: "enyo.sample.InputSample",
	classes: "input-sample",
	components: [
		{tag: "label", content: "Text Input", classes: "section", attributes: [{"for": "inputText"}]},
		{kind: "enyo.Input", name: "inputText", type: "text", placeholder: "Text", value: "Initial Value", onchange: "inputChanged", oninput: "inputOccurred"},
		{tag: "label", content: "Select On Focus Input", classes: "section", attributes: [{"for": "inputSelectOnFocus"}]},
		{kind: "enyo.Input", name: "inputSelectOnFocus", type: "text", placeholder: "Select On Focus", value: "This text will be selected when focused", selectOnFocus: true, onchange: "inputChanged", oninput: "inputOccurred"},
		{tag: "label", content: "Password Input", classes: "section", attributes: [{"for": "inputPassword"}]},
		{kind: "enyo.Input", name: "inputPassword", type: "password", placeholder: "Password", onchange: "inputChanged", oninput: "inputOccurred"},
		{tag: "label", content: "Email Input", classes: "section", attributes: [{"for": "inputEmail"}]},
		{kind: "enyo.Input", name: "inputEmail", type: "email", placeholder: "Email", onchange: "inputChanged", oninput: "inputOccurred"},
		{tag: "label", content: "Search Input", classes: "section", attributes: [{"for": "inputSearch"}]},
		{kind: "enyo.Input", name: "inputSearch", type: "search", placeholder: "Search", onchange: "inputChanged", oninput: "inputOccurred"},
		{tag: "label", content: "Number Input", classes: "section", attributes: [{"for": "inputNumber"}]},
		{kind: "enyo.Input", name: "inputNumber", type: "number", placeholder: "Number", onchange: "inputChanged", oninput: "inputOccurred"},
		{tag: "label", content: "Disabled Input", classes: "section", attributes: [{"for": "inputDisabled"}]},
		{kind: "enyo.Input", name: "inputDisabled", disabled: true, value: "Disabled", onchange: "inputChanged", oninput: "inputOccurred"},
		{kind: "enyo.Button", name: "buttonInputToggle", ontap: "buttonInputToggleTapped", content: "Toggle Input State"},
		{name: "results", classes: "results"}
	],
	inputChanged: function(inSender, inEvent) {
		this.$.results.setContent("The value of \"" + inSender.getName() + "\" has been changed to: \"" + inSender.getValue() + "\".");
	},
	inputOccurred: function(inSender, inEvent) {
		this.$.results.setContent("The current value of \"" + inSender.getName() + "\" is: \"" + inSender.getValue() + "\".");
	},
	buttonInputToggleTapped: function(inSender, inEvent) {
		this.$.inputDisabled.setDisabled(!this.$.inputDisabled.getDisabled()).setValue(this.$.inputDisabled.getDisabled() ? "Disabled" : "Enabled");
		this.$.results.setContent("The current state of \"inputDisabled\" is \"" + (this.$.inputDisabled.getDisabled() ? "disabled" : "enabled") + "\".");
	}
});
