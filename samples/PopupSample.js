/*
	Implementation notes:
	-	The Popup At Event Position popup has property floating:true to mitigate the sampler's 
		horizontal scroll offset (the control that allows the side navigation to be dragged 
		closed and open).
*/
enyo.kind({
	name: "enyo.sample.PopupSample",
	kind: "enyo.Scroller",
	classes: "popup-sample",
	components: [
		{content: "Popups", classes: "section"},
		{kind: "enyo.Button", name: "buttonBasicAuto", content: "Basic Popup (Auto Dismiss)", ontap: "showPopup", popup: "popupBasicAuto"},
		{kind: "enyo.Popup", name: "popupBasicAuto", classes: "popup", content: "Tap Outside Popup To Dismiss"},
		{classes: "divider"},
		{kind: "enyo.Button", name: "buttonBasic", content: "Basic Popup", ontap: "showPopup", popup: "popupBasic"},
		{kind: "enyo.Popup", name: "popupBasic", autoDismiss: false, classes: "popup", content: "Press Basic Popup Button To Dismiss (Tapping Outside Registers Event)"},
		{classes: "divider"},
		{kind: "enyo.Button", name: "buttonModal", content: "Modal Popup", ontap: "showPopup", popup: "popupModal"},
		{kind: "enyo.Popup", name: "popupModal", modal: true, autoDismiss: false, classes: "popup", components: [
			{content: "Modal Popup (Tapping Outside Does Not Register Event)"},
			{kind: "enyo.Button", name: "buttonCloseModal", content: "Close", ontap: "closeModal"}
		]},
		{classes: "divider"},
		{kind: "enyo.Button", name: "buttonCentered", content: "Centered Popup", ontap: "showPopup", popup: "popupCentered"},
		{kind: "enyo.Popup", name: "popupCentered", centered: true, classes: "popup", content: "Centered Popup"},
		{classes: "divider"},
		{kind: "enyo.Button", name: "buttonScrim", content: "Popup With Scrim", ontap: "showPopup", popup: "popupScrim"},
		{kind: "enyo.Popup", name: "popupScrim", centered: true, floating: true, scrim: true, classes: "popup", content: "Popup With Scrim"},
		{classes: "divider"},
		{kind: "enyo.Button", name: "buttonAtEventPosition", content: "Popup At Event Position", ontap: "showPopupAtEventPosition", popup: "popupEventPosition"},
		{kind: "enyo.Popup", name: "popupEventPosition", floating: true, classes: "popup", content: "Popup At Event Position"},
		{classes: "divider"},
		{kind: "enyo.Button", name: "buttonAtPosition", content: "Popup At Specific Position", ontap: "showPopupAtPosition", popup: "popupPosition"},
		{kind: "enyo.Popup", name: "popupPosition", classes: "popup", content: "Popup In Upper Right"},
		{classes: "divider"},
		{kind: "enyo.Button", name: "buttonAutoHide", content: "Auto Hide Popup", ontap: "showPopupAutoHide", popup: "popupAutoHide"},
		{kind: "enyo.Popup", name: "popupAutoHide", classes: "popup", content: "This Popup Will Disappear In 2s"},
		{classes: "divider"},
		{kind: "enyo.Button", name: "buttonFloating", content: "Floating Popup", ontap: "showPopupFloating", popup: "popupFloating"},
		{kind: "enyo.Popup", name: "popupFloating", floating: true, centered: true, classes: "popup floating", content: "This Popup Will Not Scroll", onHide: "hideFloating"},
		{name: "priority", classes: "priority", showing: false, content: "This Content Is Scrollable"},
		{name: "results", classes: "results"}
	],
	handlers: {
		ontap: "tap"
	},
	tap: function(inSender, inEvent) {
		this.$.results.destroyClientControls();
		this.$.results.createComponent({
			content: "Event  \"" + inEvent.type + "\" from \"" + inEvent.originator.getName() + "\"."
		});
		this.$.results.render();
	},
	closeModal: function(inSender, inEvent) {
		this.$.popupModal.setShowing(false);
	},
	hideFloating: function(inSender, inEvent) {
		this.$.priority.hide();
	},
	showPopup: function(inSender, inEvent) {
		var p = this.$[inSender.popup];
		if (p) {
			// toggle the visibility of the popup
			p.setShowing(!p.getShowing());
		}
	},
	showPopupAtEventPosition: function(inSender, inEvent) {
		var p = this.$[inSender.popup];
		if (p) {
			p.showAtEvent(inEvent);
		}
	},
	showPopupAtPosition: function(inSender, inEvent) {
		var p = this.$[inSender.popup];
		if (p) {
			p.showAtPosition({right: 0, top: 0});
		}
	},
	showPopupAutoHide: function(inSender, inEvent) {
		var p = this.$[inSender.popup];
		if (p) {
			p.setShowing(true);
			enyo.job("autoHidePopup", function() { 
				p.hide(); 
			}, 2000);
		}
	},
	showPopupFloating: function(inSender, inEvent) {
		this.$.priority.setShowing(true);
		var p = this.$[inSender.popup];
		if (p) {
			p.showAtEvent(inEvent);
		}
	}
});
