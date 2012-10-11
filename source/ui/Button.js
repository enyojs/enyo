/**
	_enyo.Button_ implements an HTML button, with support for grouping using
	<a href="#enyo.Group">enyo.Group</a>.
	
	For more information, see the documentation on
	<a href="https://github.com/enyojs/enyo/wiki/Buttons">Buttons</a> in the
	Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Button",
	//* @protected
	kind: enyo.ToolDecorator,
	tag: "button",
	//* @public
	published: {
		//* When true, button is shown as disabled and does not generate tap
		//* events
		disabled: false
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
	},
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
