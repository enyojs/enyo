/**
A prompt with confirm and cancel buttons. The onConfirm and onCancel events fire when the user
clicks the confirm and cancel buttons, respectively.
*/
enyo.kind({
	name: "enyo.ConfirmPrompt",
	kind: enyo.HFlexBox,
	published: {
		confirmContent: enyo._$L("Confirm"),
		cancelContent: enyo._$L("Cancel")
	},
	className: "enyo-confirmprompt",
	events: {
		onConfirm: "confirmAction",
		onCancel: "cancelAction"
	},
	//* @protected
	defaultKind: "Button",
	align: "center",
	pack: "center",
	components: [
		{name: "cancel", onclick: "doCancel"},
		{name: "confirm", className: "enyo-button-negative", style: "margin-left: 14px;", onclick: "doConfirm"}
	],
	create: function() {
		this.inherited(arguments);
		this.confirmContentChanged();
		this.cancelContentChanged();
	},
	confirmContentChanged: function() {
		this.$.confirm.setContent(this.confirmContent);
	},
	cancelContentChanged: function() {
		this.$.cancel.setContent(this.cancelContent);
	}
});
