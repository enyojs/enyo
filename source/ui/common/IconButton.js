/**
	_enyo.common.IconButton_ is the base kind for stylized icon-button controls that live in external
	sources. It contains common properties/methods that are shared between multiple
	libraries.

	It is not intended for an _enyo.common.IconButton_ to be used directly. For use cases,
	refer to the implementation in <a href="#onyx.IconButton">onyx.IconButton</a>.
*/
enyo.kind({
	name: "enyo.common.IconButton",
	kind: "enyo.common.Icon",
	published: {
		//* Used when the IconButton is part of a <a href="#enyo.Group">enyo.Group</a>, true
		//* to indicate that this is the active button of the group, false otherwise.
		active: false
	},
	handlers: {
		ondown: "down",
		onenter: "enter",
		ondrag: "drag",
		onleave: "leave",
		onup: "up"
	},
	rendered: function() {
		this.inherited(arguments);
		this.activeChanged();
	},
	tap: function() {
		if (this.disabled) {
			this.log();
			return true;
		}
		this.setActive(true);
	},
	down: function(inSender, inEvent) {
		this.addClass("pressed");
		this._isInControl = true;
	},
	enter: function(inSender, inEvent) {
		this._isInControl = true;
	},
	drag: function(inSender, inEvent) {
		this.addRemoveClass("pressed", this._isInControl);
	},
	leave: function(inSender, inEvent) {
		this.removeClass("pressed");
		this._isInControl = false;
	},
	up: function(inSender, inEvent) {
		this.removeClass("pressed");
		this._isInControl = false;
	},
	activeChanged: function() {
		this.bubble("onActivate");
	}
});
