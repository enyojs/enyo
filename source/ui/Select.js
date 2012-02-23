enyo.kind({
	name: "enyo.Select",
	tag: "select",
	defaultKind: "enyo.Option",
	published: {
		selected: 0,
	},
	handlers: {
		onchange: "change"
	},
	rendered: function() {
		this.inherited(arguments);
		this.selectedChanged();
	},
	selectedChanged: function() {
		this.setNodeProperty("selectedIndex", this.selected);
	},
	getSelected: function() {
		return this.getNodeProperty("selectedIndex", this.selected);
	},
	change: function() {
		this.selected = this.getSelected();
	},
	getValue: function() {
		if (this.hasNode()) {
			return this.node.value;
		}
	}
});

enyo.kind({
	name: "enyo.Option",
	tag: "option",
	published: {
		value:"",
	},
	create: function() {
		this.inherited(arguments);
		this.valueChanged();
	},
	valueChanged: function() {
		this.setAttribute("value", this.value);
	}
});

enyo.kind({
	name: "enyo.OptGroup",
	tag: "optgroup",
	defaultKind: "enyo.Option",
	published: {
		label: ""
	},
	create: function() {
		this.inherited(arguments);
		this.labelChanged();
	},
	labelChanged: function() {
		this.setAttribute("label", this.label);
	},
});
