/**
A prompt with confirm and cancel buttons that scrims the rest of the application when shown.
*/
enyo.kind({
	name: "enyo.ScrimmedConfirmPrompt",
	kind: enyo.Control,
	published: {
		confirmContent: enyo._$L("Confirm"),
		cancelContent: enyo._$L("Cancel")
	},
	events: {
		onConfirm: "",
		onCancel: ""
	},
	className: "enyo-confirmprompt",
	components: [
		{name: "confirm", kind: "ConfirmPrompt", className: "enyo-fit enyo-confirmprompt-scrim", onConfirm: "doConfirm", onCancel: "doCancel"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.confirmContentChanged();
		this.cancelContentChanged();
	},
	confirmContentChanged: function() {
		this.$.confirm.setConfirmContent(this.confirmContent);
	},
	cancelContentChanged: function() {
		this.$.confirm.setCancelContent(this.cancelContent);
	}
});
