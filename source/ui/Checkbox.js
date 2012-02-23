enyo.kind({
	name: "enyo.Checkbox",
	kind: enyo.Input,
	attributes: {
		type: "checkbox"
	},
	events: {
		onActivate: ""
	},
	published: {
		checked: false,
		active: false
	},
	handlers: {
		onchange: "change"
	},
	create: function() {
		this.inherited(arguments);
		this.checkedChanged();
	},
	// checkbox supports native 'checked' property
	getChecked: function() {
		return Boolean(this.getNodeProperty("checked", this.checked));
	},
	setChecked: function(inChecked) {
		// default property mechanism can't track changed correctly for virtual properties
		this.setPropertyValue("checked", Boolean(inChecked), "checkedChanged");
	},
	checkedChanged: function() {
		this.setAttribute("checked", this.checked ? "checked" : "");
		this.setNodeProperty("checked", this.checked);
		this.setActive(this.checked);
	},
	// active property supports grouping containers
	activeChanged: function() {
		this.active = Boolean(this.active);
		if (this.checked != this.active) {
			this.setChecked(this.active);
		}
		this.bubble("onActivate");
	},
	// all input type controls support 'value' property
	setValue: function(inValue) {
		this.setChecked(Boolean(inValue));
	},
	getValue: function() {
		return this.getChecked();
	},
	valueChanged: function() {
		// cancel Input value handling
	},
	change: function() {
		this.checked = this.getValue();
		this.setActive(this.checked);
	}
});
