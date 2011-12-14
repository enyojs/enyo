/**
 Base kind for popup controls, generally not for direct use.
 */
enyo.kind({
	name: "enyo.BasicPopup",
	kind: enyo.LazyControl,
	published: {
		modal: false,
		dismissWithClick: true,
		dismissWithEscape: true,
		shareScrim: true,
		// by default show a transparent scrim when modal
		scrimWhenModal: true,
		scrim: false,
		scrimClassName: "",
		/**
			Close automatically if the application is minimized.
			Note, the popup will also close automatically in this case if dismissWithClick is true.
		*/
		autoClose: false,
		inlineRendering: false,
		captureEvents: true
	},
	events: {
		/**
			Event fired right before the popup is opened. If the popup's contained components are created lazily,
			they will be ready at this time. By handling this event, it's possible to effect popup contents before
			the popup is displayed.
			
			inFirstOpen {Boolean} Flag indicating if this is the first time the popup has opened.
		*/
		onBeforeOpen: "",
		/**
			Event fired after the popup has been opened.
		*/
		onOpen: "",
		/**
			Event fired right before the popup is closed.
		*/
		onBeforeClose: "",
		/**
			Event fired after the popup is closed.

			inEvent {Event} (optional) event that triggered the close.
			inReason {String} (optional) reason the popup was closed.
		*/
		onClose: ""
	},
	//* @protected
	statics: {
		count: 0,
		modalCount: 0
	},
	tools: [
		{kind: "WindowEvents", onKeydown: "windowKeydownHandler"},
	],
	showing: false,
	defaultZ: 120,
	className: "enyo-popup",
	create: function() {
		this.inherited(arguments);
		this.dispatcher = enyo.dispatcher;
		// NOTE: it's important that popups goes into an un-webkit-transformed node
		// This is because position: fixed does not interact with webkit-transform.
		// FIXME: we want to dynamically set the parent of the popup so that it's rendered
		// in the popup layer. Currently we want to avoid altering the container from 
		// its normal setting. This is because the container tree is used for propagating 
		// messages to controls. Popup needs to process the "hidden" message to automagically
		// hide when one of its containers hide. Previously we did this with setParent; 
		// currently container drives parent. Need to consider the appropriate api to use here.
		// For now we use addChild.
		//this.setParent(enyo.getPopupLayer());
		if (!this.inlineRendering) {
			enyo.getPopupLayer().addChild(this);
		}
	},
	destroy: function() {
		this.close(null, "popup:destroyed");
		this.inherited(arguments);
	},
	componentsReady: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	dispatchDomEvent: function(e) {
		var r = this.inherited(arguments);
		// avoid bubbling dom events if we are not modal and will therefore forward events
		// this prevents events from being sent twice to ancestors of both the popup and the event dispatch target.
		return !this.modal ? true : r;
	},
	//* @public
	/**
		If the popup is open, close it; otherwise, open it.
	*/
	toggleOpen: function() {
		if (this.isOpen) {
			this.close(null, "popup:toggled");
		} else {
			this.open();
		}
	},
	/**
		Open the popup in its current position.
	*/
	open: function() {
		if (this.prepareOpen()) {
			this.showHideScrim(this.isOpen);
			this.renderOpen();
		}
	},
	/**
		Close the popup. The inReason argument describes why the popup was closed. Any control inside a popup
		that has a popupHandler property will close the popup when clicked and will pass the value of popupHandler
		as the reason the popup was closed. In addition, the popup can be closed automatically in some cases and will 
		pass a message of the form "popup:reason" in this case. For example, when a popup is open and is destroyed,
		it is closed with the reason "popup:destroyed."

		inEvent {Event} Event that triggered the close.
		inReason {String} A reason that this popup closed.
	*/
	close: function(inEvent, inReason) {
		if (this.isOpen) {
			this.closeInfo = {
				event: inEvent,
				reason: inReason
			}
			this.isOpen = false;
			this.prepareClose();
			this.renderClose();
			this.showHideScrim(this.isOpen);
		}
	},
	//* @protected
	canOpen: function() {
		return !this.isOpen;
	},
	prepareOpen: function() {
		if (this.canOpen()) {
			this.isOpen = true;
			enyo.BasicPopup.count++;
			// keep track of number of modal controls
			if (this.modal) {
				enyo.BasicPopup.modalCount++;
			}
			//
			this.applyZIndex();
			// flag for recording if we received a mousedown after opening
			this._didOpenMousedown = false;
			this.validateComponents();
			if (!this.generated) {
				this.render();
			}
			this.doBeforeOpen(!this.hasOpened);
			this.hasOpened = true;
			if (this.captureEvents) {
				this.dispatcher.capture(this, !this.modal);
			}
			return true;
		}
	},
	renderOpen: function() {
		this.show();
		this.finishOpen();
	},
	finishOpen: function() {
		enyo.asyncMethod(this, "afterOpen");
	},
	afterOpen: function() {
		// Indicate that we have resized; allows controls that need to respond to being resized
		// e.g. VirtualLists to update their size.
		this.broadcastToControls("resize");
		this.doOpen();
	},
	prepareClose: function() {
		this.doBeforeClose();
		if (this.showing) {
			enyo.BasicPopup.count--;
			if (this.modal) {
				enyo.BasicPopup.modalCount--;
			}
			if (this.captureEvents) {
				this.dispatcher.release();
			}
		}
	},
	renderClose: function() {
		this.hide();
		this.finishClose();
	},
	finishClose: function() {
		// force any content within this popup to blur if it has focus when we're closing
		// this ensures anything that depends on focus state (e.g. virtual keyboard) will behave
		// as expected
		this.blurContents();
		this.broadcastToControls("hidden");
		this.zIndex = null;
		this.applyStyle("z-index", null);
		enyo.asyncMethod(this, "afterClose");
	},
	afterClose: function() {
		this.doClose(this.closeInfo.event, this.closeInfo.reason);
	},
	blurContents: function() {
		var c = enyo.findFocusedControl();
		if (c && c.isDescendantOf(this) && c.hasNode()) {
			c.node.blur();
		}
	},
	showHideScrim: function(inShow) {
		if (this.scrim || (this.modal && this.scrimWhenModal)) {
			var scrim = this.getScrim();
			if (inShow) {
				// move scrim to just under the popup to obscure rest of screen
				var i = this.getScrimZIndex();
				this.scrimZ = i;
				scrim.showAtZIndex(i);
			} else {
				scrim.hideAtZIndex(this.scrimZ);
			}
			enyo.call(scrim, "addRemoveClass", [this.scrimClassName, scrim.showing]);
		}
	},
	getScrimZIndex: function() {
		return this.findZIndex()-1;
	},
	getScrim: function() {
		// show a transparent scrim for modal popups if scrimWhenModal is true
		// if scrim is true, then show a regular scrim.
		if (this.modal && this.scrimWhenModal && !this.scrim) {
			return enyo.scrimTransparent.make();
		}
		if (this.shareScrim) {
			return enyo.scrim.make();
		} else {
			if (!this.$.scrim) {
				this.createComponent({name: "scrim", kind: "Scrim", parent: this.parent});
				this.$.scrim.render();
			}
			return this.$.scrim;
		}
	},
	applyZIndex: function() {
		this.zIndex = enyo.BasicPopup.count * 2 + this.findZIndex() + 1;
		// leave room for scrim
		this.applyStyle("z-index", this.zIndex);
	},
	findZIndex: function() {
		// a default z value
		var z = this.defaultZ;
		if (this.zIndex) {
			z = this.zIndex;
		} else if (this.hasNode()) {
			z = Number(enyo.dom.getComputedStyleValue(this.node, "z-index")) || z;
		}
		return (this.zIndex = z);
	},
	getZIndex: function() {
		return this.zIndex;
	},
	// open / close events
	mousedownHandler: function(inSender, e) {
		// prevent focusing from shifting if we're modal.
		if (this.modal && !e.dispatchTarget.isDescendantOf(this)) {
			e.preventDefault();
		}
		// record that we received a mousedown after opening
		this._didOpenMousedown = true;
		return this.fire("onmousedown", e);
	},
	clickHandler: function(inSender, inEvent) {
		// only process click if we've received a mousedown after opening.
		// avoids a problem where popup can immediately close if it's opened when a click is pending
		// (e.g. mousedown, focus).
		if (this._didOpenMousedown) {
			this.processClick(inSender, inEvent);
		}
		return this.doClick(inEvent);
	},
	processClick: function(inSender, inEvent) {
		// dismiss on click if property is set and click was outside the popup
		// Note, even modal popups can be dismissed with click.
		if (this.dismissWithClick && !inEvent.dispatchTarget.isDescendantOf(this)) {
			if (inEvent.dispatchTarget != enyo.dispatcher.rootHandler) {
				this.close(inEvent, "popup:click");
			}
		// dismiss if the click was on a control set as a "popupHandler" 
		} else {
			var handler = this.findPopupHandler(inSender);
			if (handler) {
				this.close(inEvent, handler.popupHandler);
			}
		}
	},
	blurHandler: function(inSender, e) {
		this.lastFocus = inSender;
		return this.fire("blur", e);
	},
	focusHandler: function(inSender, e) {
		if (this.modal && !inSender.isDescendantOf(this)) {
			var n = (this.lastFocus && this.lastFocus.hasNode()) || this.hasNode();
			if (n) {
				n.focus();
			}
		}
		return this.fire("focus", e);
	},
	// FIXME: one way or the other, we're getting keydown (should WindowEvents always get key events?)
	windowKeydownHandler: function(inSender, e) {
		if (this.isOpen) {
			return this.keydownHandler(inSender, e);
		}
	},
	keydownHandler: function(inSender, e) {
		switch (e.keyCode) {
			case 27: 
				if (this.dismissWithEscape) {
					this.close(e, "popup:escape");
					enyo.stopEvent(e);
				}
				return true;
		}
	},
	findPopupHandler: function(inControl) {
		var c = inControl;
		while (c && c.isDescendantOf(this)) {
			if (c.popupHandler) {
				return c;
			}
			c = c.parent;
		}
	},
	hiddenHandler: function() {
		this.close(null, "popup:hidden");
	},
	// sent when control should be auto-hidden, e.g. when window deactivates or is hidden.
	autoHideHandler: function() {
		if (this.dismissWithClick || this.autoClose) {
			this.close(null, "popup:autoclose");
		}
		this.broadcastToControls("autoHide");
	}
});