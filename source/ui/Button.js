/**
	_enyo.Button_ implements an HTML button, with support for grouping using
	[enyo.Group](#enyo.Group).

	For more information, see the documentation on
	[Buttons](building-apps/controls/buttons.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Button",
	//* @protected
	kind: "enyo.ToolDecorator",
	tag: "button",
	attributes: {
		// set to button, as default is "submit" which can cause unexpected
		// problems when controls are used inside a form
		type: "button"
	},
	//* @public
	published: {
		//* When true, button is shown as disabled and does not generate tap
		//* events
		disabled: false
	},
	//* @protected
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.disabledChanged();
		};
	}),
	disabledChanged: function() {
		this.setAttribute("disabled", this.disabled);
	},
	tap: function() {
		if (this.disabled) {
			// work around for platforms like Chrome on Android or Opera that send
			// mouseup to disabled form controls
			return true;
		} else {
			this.setActive(true);
		}
	}
});
