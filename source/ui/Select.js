enyo.kind({
	name: "enyo.Select",
	tag: "select",
	create: function() {
		this.inherited(arguments);
		this.checkedChanged();
	},
	getValue: function() {
		return Boolean(this.getNodeProperty("checked", this.checked));
	},
	setChecked: function(inChecked) {
		// default property mechanism can't track changed correctly for virtual properties
		this.setPropertyValue("checked", inChecked, "checkedChanged");
	},
	checkedChanged: function() {
		this.setAttribute("checked", this.checked ? "checked" : "");
		this.setNodeProperty("checked", this.checked);
	},
	setValue: function(inValue) {
		this.setChecked(inValue);
	},
	valueChanged: function() {
		// cancel Input value handling
	}
});
