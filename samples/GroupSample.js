enyo.kind({
	name: "enyo.sample.GroupSample",
	classes: "group-sample",
	components: [
		{content: "Grouped Buttons", classes: "section"},
		{kind: "enyo.Group", onActiveChanged: "handleActiveChanged", classes: "grouping", components: [
			{kind: "enyo.Button", content: "Button 1"},
			{kind: "enyo.Button", content: "Button 2"},
			{kind: "enyo.Button", content: "Button 3"}
		]},
		{content: "Grouped Checkboxes", classes: "section"},
		{kind: "enyo.Group", onActiveChanged: "handleActiveChanged", classes: "grouping", components: [
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
		{kind: "enyo.Group", onActiveChanged: "handleActiveChanged", classes: "grouping", groupName: "buttonGroup", components: [
			{kind: "enyo.Button", content: "Named Button 1", groupName: "buttonGroup"},
			{kind: "enyo.Button", content: "Named Button 2 (excluded)"},
			{kind: "enyo.Button", content: "Named Button 3", groupName: "buttonGroup"}
		]},
		{content: "Multiple Active Grouped Checkboxes", classes: "section"},
		{kind: "enyo.Group", onActivate: "handleActivate", classes: "grouping", highlander: false, components: [
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
		{kind: "enyo.Group", onActivate: "handleActivate", classes: "grouping", highlander: false, components: [
			{kind: "enyo.Button", content: "Multi Button 1"},
			{kind: "enyo.Button", content: "Multi Button 2"},
			{kind: "enyo.Button", content: "Multi Button 3"}
		]},
		{name: "results", classes: "results"}
	],
	handleActiveChanged: function(inSender, inEvent) {
		this.updateResults([
			{content: "The \"" + inEvent.active.getContent() + "\" control is active."}
		]);
		return true;
	},
	handleActivate: function(inSender, inEvent) {
		if (inEvent.originator.getActive()) {
			this.updateResults([
				{content: "The \'" + inEvent.originator.getContent() + "\" control is newly active in the group."}
			]);
		}
		return true;
	},
	updateResults: function(inComponents) {
		this.$.results.destroyClientControls();
		this.$.results.createComponents(inComponents);
		this.$.results.render();
	}
});
