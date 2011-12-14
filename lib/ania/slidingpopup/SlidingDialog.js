/**
A <a href="#enyo.Popup">Popup</a> that displays a set of controls over other content.
A dialog attaches to the bottom of the screen and, when shown, 
animates up from the bottom of the screen.

To show a SlidingDialog asking the user to confirm a choice, try the following:

	components: [
		{kind: "Button", content: "Confirm choice", onclick: "showDialog"},
		{name: "dialog", kind: "SlidingDialog", components: [
			{content: "Are you sure?"},
			{layoutKind: "HFlexLayout", pack: "center", components: [
				{kind: "Button", content: "OK", onclick: "confirmClick"},
				{kind: "Button", content: "Cancel", onclick: "cancelClick"}
			]}
		]}
	],
	showDialog: function() {
		this.$.dialog.open();
	},
	confirmClick: function() {
		// process confirmation
		this.doConfirm();
		// then close dialog
		this.$.dialog.close();
	},
	cancelClick: function() {
		this.$.dialog.close();
	}
*/
enyo.kind({
	name: "enyo.SlidingDialog",
	kind: enyo.SlidingPopup,
	//* @protected
	components: [
		{name: "client", className: "enyo-sliding-dialog-inner"}
	],
	create: function() {
		this.inherited(arguments);
		this.addClass("enyo-sliding-dialog");
	}
});
