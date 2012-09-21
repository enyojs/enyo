/**
	_enyo.Popup_ is a control used to display certain content on top of other
	content.

	Popups are initially hidden on creation; they can be shown by calling the
	_show_ method and re-hidden by calling _hide_.  Popups may be centered using
	the	_centered_ property; if not centered, they should be given a specific
	position.

	A popup may be optionally floated above all application content by setting
	its _floating_ property to _true_.  This has the advantage of guaranteeing
	that the popup will be displayed on top of other content.  This usage is
	appropriate when the popup does not need to scroll along with other content.

	For more information, see the documentation on
	[Popups](https://github.com/enyojs/enyo/wiki/Popups) in the Enyo Developer
	Guide.
 */
enyo.kind({
	name: "enyo.Popup",
	classes: "enyo-popup",
	published: {
		//* Set to true to prevent controls outside the popup from receiving
		//* events while the popup is showing
		modal: false,
		//* By default, the popup will hide when the user taps outside it or
		//* presses ESC.  Set to false to prevent this behavior.
		autoDismiss: true,
		//* Set to true to render the popup in a floating layer outside of other
		//* controls.  This can be used to guarantee that the popup will be
		//* shown on top of other controls.
		floating: false,
		//* Set to true to automatically center the popup in the middle of the viewport
		centered: false
	},
	//* @protected
	showing: false,
	handlers: {
		ondown: "down",
		onkeydown: "keydown",
		ondragstart: "dragstart",
		onfocus: "focus",
		onblur: "blur",
		onRequestShow: "requestShow",
		onRequestHide: "requestHide"
	},
	captureEvents: true,
	//* @public
	events: {
		//* Fires after the popup is shown.
		onShow: "",
		//* Fires after the popup is hidden.
		onHide: ""
	},
	//* @protected
	tools: [
		{kind: "Signals", onKeydown: "keydown"}
	],
	create: function() {
		this.inherited(arguments);
		/*if (this.floating) {
			this.setParent(enyo.floatingLayer);
		}*/
		this.canGenerate = !this.floating;
	},
	render: function() {
		if (this.floating) {
			if (!enyo.floatingLayer.hasNode()) {
				enyo.floatingLayer.render();
			}
			this.parentNode = enyo.floatingLayer.hasNode();
		}
		this.inherited(arguments);
	},
	destroy: function() {
		if (this.showing) {
			this.release();
		}
		this.inherited(arguments);
	},

	reflow: function() {
		this.updatePosition();
		this.inherited(arguments);
	},
	calcViewportSize: function() {
		if (window.innerWidth) {
			return {
				width: window.innerWidth,
				height: window.innerHeight
			};
		} else {
			var e = document.documentElement;
			return {
				width: e.offsetWidth,
				height: e.offsetHeight
			};
		}
	},
	updatePosition: function() {
		if( this.centered ) {
			var d = this.calcViewportSize();
			var b = this.getBounds();

			this.addStyles( "top: " + Math.max( ( ( d.height - b.height ) / 2 ), 0 ) + "px; left: " + Math.max( ( ( d.width - b.width ) / 2 ), 0 ) + "px;" );
		}
	},
	showingChanged: function() {
		// auto render when shown.
		if (this.floating && this.showing && !this.hasNode()) {
			this.render();
		}
		// hide while sizing
		if (this.centered) {
			this.applyStyle("visibility", "hidden");
		}
		this.inherited(arguments);
		if (this.showing) {
			this.resized();
			if (this.captureEvents) {
				this.capture();
			}
		} else {
			if (this.captureEvents) {
				this.release();
			}
		}
		// show after sizing
		if (this.centered) {
			this.applyStyle("visibility", null);
		}
		// events desired due to programmatic show/hide
		if (this.hasNode()) {
			this[this.showing ? "doShow" : "doHide"]();
		}
	},
	capture: function() {
		enyo.dispatcher.capture(this, !this.modal);
	},
	release: function() {
		enyo.dispatcher.release();
	},
	down: function(inSender, inEvent) {
		//record the down event to verify in tap
		this.downEvent = inEvent;
		
		// prevent focus from shifting outside the popup when modal.
		if (this.modal && !inEvent.dispatchTarget.isDescendantOf(this)) {
			inEvent.preventDefault();
		}
	},
	tap: function(inSender, inEvent) {
		// dismiss on tap if property is set and click started & ended outside the popup
		if (this.autoDismiss && (!inEvent.dispatchTarget.isDescendantOf(this)) && this.downEvent &&
			(!this.downEvent.dispatchTarget.isDescendantOf(this))) {
			this.downEvent = null;
			this.hide();
			return true;
		}
	},
	// if a drag event occurs outside a popup, hide
	dragstart: function(inSender, inEvent) {
		var inScope = (inEvent.dispatchTarget === this || inEvent.dispatchTarget.isDescendantOf(this));
		if (inSender.autoDismiss && !inScope) {
			inSender.setShowing(false);
		}
		return true;
	},
	keydown: function(inSender, inEvent) {
		if (this.showing && this.autoDismiss && inEvent.keyCode == 27 /* escape */) {
			this.hide();
		}
	},
	// If something inside the popup blurred, keep track of it.
	blur: function(inSender, inEvent) {
		if (inEvent.dispatchTarget.isDescendantOf(this)) {
			this.lastFocus = inEvent.originator;
		}
	},
	// When something outside the popup focuses (e.g., due to tab key), focus our last focused control.
	focus: function(inSender, inEvent) {
		var dt = inEvent.dispatchTarget;
		if (this.modal && !dt.isDescendantOf(this)) {
			if (dt.hasNode()) {
				dt.node.blur();
			}
			var n = (this.lastFocus && this.lastFocus.hasNode()) || this.hasNode();
			if (n) {
				n.focus();
			}
		}
	},
	requestShow: function(inSender, inEvent) {
		this.show();
		return true;
	},
	requestHide: function(inSender, inEvent) {
		this.hide();
		return true;
	}
});
