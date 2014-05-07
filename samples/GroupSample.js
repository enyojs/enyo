/*
	Implementation notes:
	-	For button groups, using tap handler (instead of activate handler) because the 
		activate handler needs to run first to handle highlander. The reverse sequence
		occurs for checkbox groups (tap handler is run first).
	-	In the handlers, inEvent.originator is used (as opposed to inSender) because we
		are concerned with the individual group items when displaying the result; the 
		handlers are defined on the group in this sample, so inSender would refer to the
		group.
*/
enyo.kind({
	name: "enyo.sample.GroupSample",
	classes: "group-sample",
	components: [
		{content: "Grouped Buttons", classes: "section"},
		{kind: "enyo.Group", ontap: "groupTapped", classes: "grouping", components: [
			{kind: "enyo.Button", content: "Button 1"},
			{kind: "enyo.Button", content: "Button 2"},
			{kind: "enyo.Button", content: "Button 3"}
		]},
		{content: "Grouped Checkboxes", classes: "section"},
		{kind: "enyo.Group", onActivate: "groupTapped", classes: "grouping", components: [
			{tag: "label", components: [
				{kind: "enyo.Checkbox", content: "Checkbox 1"}
			]},
			{tag: "label", components: [
				{kind: "enyo.Checkbox", content: "Checkbox 2"}
			]},
			{tag: "label", components: [
				{kind: "enyo.Checkbox", content: "Checkbox 3"}
			]}
		]},
		{content: "Named Grouped Buttons", classes: "section"},
		{kind: "enyo.Group", ontap: "groupTapped", classes: "grouping", groupName: "buttonGroup", components: [
			{kind: "enyo.Button", content: "Named Button 1", groupName: "buttonGroup"},
			{kind: "enyo.Button", content: "Named Button 2 (excluded)"},
			{kind: "enyo.Button", content: "Named Button 3", groupName: "buttonGroup"}
		]},
		{content: "Multiple Active Grouped Checkboxes", classes: "section"},
		{kind: "enyo.Group", onActivate: "multiCheckboxGroupTapped", classes: "grouping", highlander: false, components: [
			{tag: "label", components: [
				{kind: "enyo.Checkbox", content: "Multi Checkbox 1"}
			]},
			{tag: "label", components: [
				{kind: "enyo.Checkbox", content: "Multi Checkbox 2"}
			]},
			{tag: "label", components: [
				{kind: "enyo.Checkbox", content: "Multi Checkbox 3"}
			]}
		]},
		{content: "Multiple Active Grouped Buttons", classes: "section"},
		{kind: "enyo.Group", ontap: "multiButtonGroupTapped", classes: "grouping", highlander: false, components: [
			{kind: "enyo.Button", content: "Multi Button 1"},
			{kind: "enyo.Button", content: "Multi Button 2"},
			{kind: "enyo.Button", content: "Multi Button 3"}
		]},
		{name: "results", classes: "results"}
	],
	groupTapped: function(inSender, inEvent) {
		if (inEvent.originator !== inSender) {
			this.updateResults([
				{content: "The \"" + inEvent.originator.getContent() + "\" control is selected."},
				{content: "The \"" + inSender.getActive().getContent() + "\" control is active."}
			]);
		}
		return true;
	},
	multiCheckboxGroupTapped: function(inSender, inEvent) {
		if (inEvent.originator !== inSender) {
			var results = [{content: "The \"" + inEvent.originator.getContent() + "\" control is selected."}],
				controls = inSender.getControls(),
				control,
				i;
			for (i = 0; i < controls.length; i++) {
				control = controls[i].getControls()[0];
				if (control.getActive()) {
					results.push({content: "The \"" + control.getContent() + "\" control is active."});
				}
			}
			this.updateResults(results);
		}
		return true;
	},
	multiButtonGroupTapped: function(inSender, inEvent) {
		if (inEvent.originator !== inSender) {
			var results = [{content: "The \"" + inEvent.originator.getContent() + "\" control is selected."}],
				controls = inSender.getControls(),
				control,
				i;
			for (i = 0; i < controls.length; i++) {
				control = controls[i];
				if (control.getActive()) {
					results.push({content: "The \"" + control.getContent() + "\" control is active."});
				}
			}
			this.updateResults(results);
		}
		return true;
	},
	updateResults: function(inComponents) {
		this.$.results.destroyClientControls();
		this.$.results.createComponents(inComponents);
		this.$.results.render();
	}
});
