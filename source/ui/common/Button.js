/**
	_enyo.common.Button_ is the base kind for stylized button controls that live in external
	sources. It contains common properties/methods that are shared between multiple
	libraries.

	It is not intended for an _enyo.common.Button_ to be used directly. For use cases,
	refer to the implementation in <a href="#onyx.Button">onyx.Button</a>.
*/
enyo.kind({
	name: "enyo.common.Button",
	kind: "enyo.Button",
	classes: "enyo-unselectable",
	handlers: {
		ondown: "down",
		onenter: "enter",
		ondrag: "drag",
		onleave: "leave",
		onup: "up"
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
	}
});
