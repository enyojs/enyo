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
		{kind: "enyo.Group", ontap: "groupButtonsTapped", components: [
			{kind: "enyo.Button", content: "Grouped Button 1"},
			{kind: "enyo.Button", content: "Grouped Button 2"},
			{kind: "enyo.Button", content: "Grouped Button 3"}
		]},
		{content: "Grouped Checkboxes", classes: "section"},
		{kind: "enyo.Group", onActivate: "groupCheckboxesActivated", components: [
			{kind: "enyo.Checkbox", content: "Checkbox 1"},
			{kind: "enyo.Checkbox", content: "Checkbox 2"},
			{kind: "enyo.Checkbox", content: "Checkbox 3"}
		]},
		{content: "Named Grouped Buttons", classes: "section"},
		{kind: "enyo.Group", ontap: "namedGroupButtonsTapped", groupName: "buttonGroup", components: [
			{kind: "enyo.Button", content: "Named Grouped Button 1", groupName: "buttonGroup"},
			{kind: "enyo.Button", content: "Named Grouped Button 2 (excluded)"},
			{kind: "enyo.Button", content: "Named Grouped Button 3", groupName: "buttonGroup"}
		]},
		{content: "Multiple Active Grouped Checkboxes", classes: "section"},
		{kind: "enyo.Group", onActivate: "groupMultiCheckboxesActivated", highlander: false, components: [
			{kind: "enyo.Checkbox", content: "Multi Checkbox 1"},
			{kind: "enyo.Checkbox", content: "Multi Checkbox 2"},
			{kind: "enyo.Checkbox", content: "Multi Checkbox 3"}
		]},
		{content: "Multiple Active Grouped Buttons", classes: "section"},
		{kind: "enyo.Group", ontap: "groupMultiButtonsTapped", highlander: false, components: [
			{kind: "enyo.Button", content: "Multi Grouped Button 1"},
			{kind: "enyo.Button", content: "Multi Grouped Button 2"},
			{kind: "enyo.Button", content: "Multi Grouped Button 3"}
		]},
		{name: "results", classes: "results"}
	],
	groupCheckboxesActivated: function(inSender, inEvent) {
		if (inEvent.originator.getActive()) {
			this.updateResult({content: "The \"" + inEvent.originator.getContent() + "\" checkbox is selected."});
		}
	},
	groupButtonsTapped: function(inSender, inEvent) {
		if (inEvent.originator.getParent().getActive && inEvent.originator.getParent().getActive()) {
			this.updateResult({content: "The \"" + inEvent.originator.getParent().getActive().getContent() + "\" button is selected."});
		}
	},
	namedGroupButtonsTapped: function(inSender, inEvent) {
		if (inEvent.originator.getParent().getActive && inEvent.originator.getParent().getActive()) {
			this.updateResult({content: "The \"" + inEvent.originator.getParent().getActive().getContent() + "\" button is selected."});
		}
	},
	groupMultiCheckboxesActivated: function(inSender, inEvent) {
		var activeCheckboxes = [],
			checkboxes = inEvent.originator.getParent().getControls();
		enyo.log(inEvent.originator.getParent());
		for (var i=0; i<checkboxes.length; i++) {
			if (checkboxes[i].getChecked()) {
				activeCheckboxes.push({content: "The \"" + checkboxes[i].getContent() + "\" checkbox is selected."});
			}
		}
		this.updateResult(activeCheckboxes);
	},
	groupMultiButtonsTapped: function(inSender, inEvent) {
		if (inEvent.originator.kindName === "enyo.Button") {
			var activeButtons = [],
				buttons = inEvent.originator.getParent().getControls();
			for (var i=0; i<buttons.length; i++) {
				if (buttons[i].getActive && buttons[i].getActive()) {
					activeButtons.push({content: "The \"" + buttons[i].getContent() + "\" button is selected."});
				}
			}
			this.updateResult(activeButtons);
		}
	},
	updateResult: function(inComponents) {
		this.$.results.destroyClientControls();
		if( Object.prototype.toString.call(inComponents) === '[object Array]' ) {
			this.$.results.createComponents(inComponents);
		} else {
			this.$.results.createComponent(inComponents);	
		}
		this.$.results.render();
	}
});
