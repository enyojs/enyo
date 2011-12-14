/**
A box that shows or hides a check mark when clicked.
The onChange event is fired when it is clicked. Use getValue() to fetch
the checked status.

	{kind: "CheckBox", onChange: "checkboxClicked"}

	checkboxClicked: function(inSender) {
		if (inSender.getValue()) {
			 this.log("I've been checked!");
		}
	}
*/
enyo.kind({
	name: "enyo.CheckBox",
	kind: enyo.Button,
	cssNamespace: "enyo-checkbox",
	className: "enyo-checkbox",
	published: {
		value: false
	},
	events: {
		/**
		The onChange event fires when the user checks or unchecks the checkbox,
		but not when the state is changed programmatically.
		*/
		onChange: ''
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.valueChanged();
	},
	contentChanged: function() {
	},
	valueChanged: function() {
		this.setState("checked", this.value);
	},
	mousedownHandler: function(inSender, e, node) {
		if (!this.disabled) {
			this.setValue(!this.value);
			this.doChange(this.value);
		}
	},
	mouseupHandler: function(inSender, e, node) {
	},
	mouseoutHandler: function(inSender, e, node) {
		this.setHot(false);
	}
});
