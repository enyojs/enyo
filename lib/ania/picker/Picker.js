/**
A control offering a selection of items.

A picker can be initialized with a simple array of strings, like so:

	{kind: "Picker", value: "name", items: ["title", "name", "first last", "bool"], onChange: "pickerPick"}

You can also specify content and value seperately, like so:

	{kind: "Picker", value: "am", items: [
		{content: "A.M.", value: "am"},
		{content: "P.M.", value: "pm"}
	]}
	
The selected item can be retrieved by calling <code>getValue</code>, like so:

	pickerPick: function(inSender) {
		this.fieldType = this.$.picker.getValue();
	}
*/

enyo.kind({
	name: "enyo.Picker",
	kind: "Selector",
	itemKind: "PickerButton",
	popupItemKind: "PickerItem",
	hideArrow: true,
	published: {
		scrim: false,
		modal: true,
		textAlign: "center",
	},
	create: function() {
		this.inherited(arguments);
		this.textAlignChanged();
		this.scrimChanged();
		this.modalChanged();
	},
	textAlignChanged: function() {
		this.popup.applyStyle("text-align", this.textAlign);
	},
	scrimChanged: function() {
		this.popup.setScrim(this.scrim);
		this.popup.setScrimWhenModal(this.scrim);
	},
	modalChanged: function() {
		this.popup.setModal(this.modal);
	},

	makePopup: function() {
		this.inherited(arguments);
		this.popup.addClass("enyo-picker-popup");
		this.popup.onClose = "popupClose";
		this.popup.onclick = "popupClick";
	},
	setItemProps: function(inItem) {
		this.item.setContent(inItem.content);
	},
	openPopup: function(inEvent) {
		this.setFocus(true);
		// tell container about popup opening before we popup
		// container may have its own popup that should be opened first.
		this.dispatch(this.container, this.containerOpenPopup);
		var n = this.hasNode();
		if (n) {
			this.popup.applyStyle("min-width", n.offsetWidth + "px");
		}
		this.popup.openAtControl(this);
		this.valueChanged();
	},
	popupClose: function(inSender, inEvent) {
		this.setFocus(false);
		this.dispatch(this.container, this.containerClosePopup, [inEvent]);
	},
	popupSetupItem: function(inSender, inItem, inRowIndex, inRowItem) {
	},
	popupChoose: function(inSender, inSelected, inOldValue) {
		var oldValue = this.value;
		this.inherited(arguments);
		if (this.value != oldValue) {
			this.dispatch(this.container, "pickerChange");
		}
	},
	popupClick: function(inSender, inEvent) {
		var t = inEvent.dispatchTarget;
		// inform our container if our popup receives a foreign click that's on one of its descendants.
		if (t && !t.isDescendantOf(this.popup) && t.isDescendantOf(this.container)) {
			this.dispatch(this.container, "pickerPopupClick", [t]);
		}
	},
	setFocus: function(inFocus) {
		this.item.setFocus(inFocus);
	}
});