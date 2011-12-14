/**
A container used to group multiple <a href="#enyo.Picker">Pickers</a> together.

	{kind: "PickerGroup", content: "preferences", onChange: "pickerPick", components: [
		{name: "searchEnginePicker", value: "Google", items: ["Google", "Yahoo", "Bing"]},
		{name: "contactTypePicker", value: "Mail", items: ["Mail", "IM", "Text"]}
	]}

The selected items can be retrieved by calling <code>getValue</code>, like so:

	pickerPick: function(inSender) {
		this.searchEngine = this.$.searchEnginePicker.getValue();
		this.contactType = this.$.contactTypePicker.getValue();
	}
*/
enyo.kind({
	name: "enyo.PickerGroup",
	kind: enyo.HFlexBox,
	published: {
		content: "",
		contentClass: ""
	},
	events: {
		onChange: ""
	},
	align: "center",
	defaultKind: "enyo.Picker",
	groupChrome: [
		{name: "content", kind: "Control", className: "enyo-picker-content enyo-content"},
		{name: "client", kind: "Control", layoutKind: "HFlexLayout"}
	],
	//* @protected
	constructor: function() {
		this.inherited(arguments);
		this.pickers = [];
	},
	create: function() {
		this.inherited(arguments);
		this.contentClassChanged();
		this.applyToPickers("setScrim", [false]);
		this.createChrome([{kind: "Popup", allowHtml: true, className:"enyo-pickergroup-pickerpopup"}]);
		this.$.client.align = this.align;
	},
	initComponents: function() {
		this.createChrome(this.groupChrome);
		this.inherited(arguments);
	},
	addControl: function(inControl) {
		this.inherited(arguments);
		if (inControl instanceof enyo.Picker) {
			inControl.containerOpenPopup = "pickerPopupOpen";
			inControl.containerClosePopup = "pickerPopupClose";
			this.pickers.push(inControl);
		}
	},
	removeControl: function(inControl) {
		this.inherited(arguments);
	},
	pickerPopupOpen: function(inSender) {
		this.applyToPickers("setFocus", [true]);
		this.openPopup();
	},
	pickerPopupClose: function(inSender, inEvent) {
		this.applyToPickers("setFocus", [false]);
		if (!this.isEventInPicker(inEvent)) {
			this.closePopup();
		}
	},
	isEventInPicker: function(inEvent) {
		var dt = inEvent && inEvent.dispatchTarget;
		if (dt) {
			for (var i=0, p; p=this.pickers[i]; i++) {
				if (dt.isDescendantOf(p)) {
					return true;
				}
			}
		}
	},
	// NOTE: Pretty tricky here. We duplicate the rendering of content into our group popup. This is 
	// so that it can be displayed over top of the client and appear to duplicate it.
	// We render a duplicate of the client in a popup so that it can be displayed over top of a scrim.
	openPopup: function() {
		var p = this.$.popup;
		if (!p.isOpen) {
			p.openAtControl(this.$.client);
			p.setContent(this.$.client.generateHtml());
			this.scrimZ = this.$.popup.getScrimZIndex();
			enyo.scrimTransparent.showAtZIndex(this.scrimZ);
		}
	},
	// NOTE: popup content duplicates client content. It should be cleared
	// when closed so dom doesn't get confused finding nodes.
	closePopup: function() {
		this.$.popup.setContent("");
		this.$.popup.close();
		enyo.scrimTransparent.hideAtZIndex(this.scrimZ);
	},
	applyToPickers: function(inFunc, inArgs) {
		for (var i=0, p; p=this.pickers[i]; i++) {
			p[inFunc].apply(p, inArgs);
		}
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
	},
	contentClassChanged: function(inOldValue) {
		inOldValue && this.$.content.removeClass(inOldValue);
		this.contentClass && this.$.content.addClass(this.contentClass);
	},
	pickerChange: function() {
		// PickerGroup itself doesn't has value but subkinds (e.g. DatePicker) may have a value and
		// it will be returned with the event.
		this.doChange(this.value);
	},
	findTargetPicker: function(inTarget) {
		for (var i=0, p; p=this.pickers[i]; i++) {
			if (inTarget.isDescendantOf(p)) {
				return p
			}
		}
	},
	// called when a picker popup receives a click from a target with the
	// same container as the picker (i.e. another picker in this group)
	pickerPopupClick: function(inSender, inTarget) {
		var p = this.findTargetPicker(inTarget);
		if (p && p != inSender) {
			p.openPopup();
		}
	},
	resizeHandler: function() {
		this.inherited(arguments);
		for (var i=0, p; p=this.pickers[i]; i++) {
			p.resized();
		}
	},
});
