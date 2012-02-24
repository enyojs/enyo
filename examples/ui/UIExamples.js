enyo.kind({
	name: "UIExamples",
	classes: "enyo-children-middle",
	components: [
		{content: "Button"},
		{kind: "Button", content: "Gabel"},
		{kind: "Button", content: "Gabelllishisnous"},
		{kind: "Button", components: [
			{kind: "Image", src: "images/search.png", style: "padding-right: 4px;"},
			{content: "Label"}
		]},
		{tag: "hr"},
		//
		{content: "Grouped Buttons"},
		{kind: "Group", highlander: true, defaultKind: "Button", components: [
			{content: "Stay"},
			{content: "Go"},
			{content: "Stay or Go"},
			{content: "Stay and Go"}
		]},
		//
		{content: "Grouped Checkboxes"},
		{kind: "Group", highlander: true, defaultKind: "Checkbox", components: [
			{content: "&nbsp;Stay &nbsp;&nbsp;"},
			{content: "&nbsp;Go &nbsp;&nbsp;"},
			{content: "&nbsp;Stay or Go &nbsp;&nbsp;"},
			{content: "&nbsp;Stay and Go &nbsp;&nbsp;"}
		]},
		//
		{tag: "hr"},
		{content: "enyo.Input"},
		{tag: "span", name: "default", content: "someValue", classes: "data"},
		{tag: "button", content: "value =>", ontap: "setValueTap"},
		{kind: "Input", value: "initial"},
		{tag: "button", content: "value =>", ontap: "getValueTap"},
		{tag: "span", name: "value", content: "&nbsp;", classes: "data"},
		{tag: "hr"},
		//
		{content: "enyo.Checkbox"},
		{tag: "span", name: "checkDefault", content: "someValue", classes: "data"},
		{tag: "button", content: "value =>", ontap: "setCheckValueTap"},
		{name: "valueCheckbox", kind: "Checkbox", checked: "true"},
		{tag: "button", content: "value =>", ontap: "getCheckValueTap"},
		{tag: "span", name: "checkValue", content: "&nbsp;", classes: "data"},
		{tag: "hr"},
		//
		{content: "ToolDecorator"},
		{kind: "ToolDecorator", components: [
			{content: "label", style: "padding: 8px;"},
			{kind: "Input", value: "Goodies and Bits", style: "padding: 8px;"}
		]},
		{tag: "hr"},
		//
		{content: "ToolDecorator"},
		{kind: "ToolDecorator", components: [
			{tag: "img", src: "images/search.png", style: "padding: 4px;"},
			{kind: "Input", value: "Goodies and Bits", style: "width: 300px;"}
		]},
		{tag: "hr"},
		//
		{content: "enyo.Select"},
		{kind: "Button", ontap: "selectEnyo", content: "Select Best Framework =>"},
		{kind: "Select", components: [
			{value: "enyo", content: "Enyo"},
			{value: "mojo", content: "Mojo"},
			{value: "dojo", content: "Dojo"},
			{value: "jquery", content: "jQuery"}
		]},
		{kind: "Button", content: "value =>", ontap: "getSelectedValue"},
		{tag: "span", name: "selectValue", content: "&nbsp;", classes: "data"},
		{tag: "hr"},
		//
		{content: "SearchDecorator: An example of using InputDecorator and some fancy styling"},
		{kind: "SearchDecorator", components: [
			{kind: "Input", value: "Goodies and Bits"}
		]}
	],
	//
	getValueTap: function() {
		this.$.value.setContent(this.$.input.getValue());
	},
	setValueTap: function() {
		this.$.input.setValue(this.$.default.getContent());
	},
	//
	getCheckValueTap: function() {
		this.$.checkValue.setContent(this.$.valueCheckbox.getValue());
	},
	setCheckValueTap: function() {
		this.$.valueCheckbox.setValue(this.$.checkDefault.getContent());
	},
	selectEnyo: function() {
		this.$.select.setSelected(0);
	},
	getSelectedValue: function() {
		this.$.selectValue.setContent(this.$.select.getValue() + ", index: " + this.$.select.getSelected());
	}
});
