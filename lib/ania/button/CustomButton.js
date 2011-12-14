/**
A CustomButton is a button without any visual treatment. It should be used when a button primitive with unique appearance is desired.
Typically, a CSS class is specified via the className property. CustomButton implements mouse handling for a well-defined set of states.
Initialize a button as follows:

	{kind: "CustomButton", content: "OK", className: "myButton", onclick: "buttonClick"}

Set the toggling property to true to create a button with toggling behavior of down when clicked and up when clicked again.
*/
enyo.kind({
	name: "enyo.CustomButton",
	kind: enyo.Stateful,
	cssNamespace: "enyo-button",
	className: "enyo-custom-button",
	published: {
		disabled: false,
		isDefault: false,
		down: false,
		depressed: false,
		hot: false,
		toggling: false,
		/**
			By default dragging buttons is disabled. This is done so that a sloppy click that causes a small drag
			is still processed as a click and not a drag. A button can be set to allow dragging by setting this 
			allowDrag property to true.
		*/
		allowDrag: false
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
		this.isDefaultChanged();
		this.downChanged();
		this.depressedChanged();
	},
	disabledChanged: function() {
		this.stateChanged("disabled");
	},
	isDefaultChanged: function() {
		this.stateChanged("isDefault");
	},
	downChanged: function() {
		this.stateChanged("down");
	},
	hotChanged: function() {
		this.stateChanged("hot");
	},
	depressedChanged: function() {
		this.stateChanged("depressed");
	},
	mouseoverHandler: function(inSender, e) {
		this.setHot(true);
	},
	mouseoutHandler: function(inSender, e) {
		this.setHot(false);
		this.setDown(false);
	},
	mousedownHandler: function(inSender, e) {
		if (!this.disabled) {
			this.setDown(true);
			return this.doMousedown(e);
		}
	},
	mouseupHandler: function(inSender, e) {
		if (!this.disabled && this.down) {
			this.setDown(false);
			return this.doMouseup(e);
		}
	},
	// FIXME: flick should not be required to reset down state as mouseup + mouseout specify all
	// cases where down should be set to false; however, on device, occasionally when flicking
	// the mouseup or mouseout is simply not sent. This behavior occurs even on a simple, non-enyo test.
	// Therefore, it's necessary to turn off down on flick.
	flickHandler: function(inSender, e) {
		if (!this.disabled && this.down) {
			this.setDown(false);
		}
	},
	clickHandler: function(inSender, e) {
		if (!this.disabled) {
			if (this.toggling) {
				this.setDepressed(!this.depressed);
			}
			return this.doClick(e);
		}
	},
	dragstartHandler: function() {
		// We have to differentiate drags from clicks on buttons.
		// 'allowDrag' controls whether drags are allowed at all
		// on buttons. If drags are allowed, only non-drag clicks
		// are recognized as clicks.
		if (this.allowDrag) {
			this.setDown(false);
		} else {
			// if you push down a button, the button needs to retain this down state
			// iff the pointer is over the button, until the button is released
			// this flag let's us update the down state in dragover/dragout handlers
			this.drag = !this.disabled;
			// prevent dragging because we want to track
			// button clicks with priority
			return true;
		}
	},
	dragoverHandler: function(inSender, inEvent) {
		// if we are dragging on this button, we need to be down
		// when over (and not-down when out, see mouseoutHandler)
		// we don't use dragoutHandler because it will only fire
		// if hysteresis is satisfied while over this object
		// (in other words, the drag may not actually start until
		// the pointer is already out of this node)
		if (this.drag && !this.down) {
			this.setDown(true);
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		this.drag = false;
		// if we allow drags on this button, then 
		// we never allow click after drag
		if (this.allowDrag) {
			inEvent.preventClick();
		}
	}
});
