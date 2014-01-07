enyo.kind({
	name: "enyo.sample.CheckboxSample",
	classes: "checkbox-sample",
	components: [
		{content: "Checkboxes", classes: "section"},
		{kind: "enyo.Checkbox", content: "Checkbox 1", onchange: "checkboxChanged"},
		{kind: "enyo.Checkbox", content: "Checkbox 2", onchange: "checkboxChanged"},
		{kind: "enyo.Checkbox", content: "Checkbox 3", onchange: "checkboxChanged"},
		{content: "Grouped Checkboxes", classes: "section"},
		{kind: "enyo.Group", onActivate: "groupActivated", components: [
			{kind: "enyo.Checkbox", content: "Grouped Checkbox 1"},
			{kind: "enyo.Checkbox", content: "Grouped Checkbox 2"},
			{kind: "enyo.Checkbox", content: "Grouped Checkbox 3"}
		]},
		{name: "results", classes: "results"}
	],
	checkboxChanged: function(inSender, inEvent) {
		this.updateResult({content: "The \"" + inEvent.originator.getContent() + "\" checkbox is " + (inSender.getChecked() ? "checked": "unchecked") + "."});
	},
	groupActivated: function(inSender, inEvent) {
		if (inEvent.originator.getActive()) {
			this.updateResult({content: "The \"" + inEvent.originator.getContent() + "\" checkbox is selected."});
		}
	},
	updateResult: function(inComponents) {
		this.$.results.destroyClientControls();
		this.$.results.createComponent(inComponents);
		this.$.results.render();
	}
});
