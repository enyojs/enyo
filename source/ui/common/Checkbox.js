/**
	_enyo.common.Checkbox_ is the base kind for stylized checkbox controls that live in external
	sources. It contains common properties/methods that are shared between multiple
	libraries.

	It is not intended for an _enyo.common.Checkbox_ to be used directly. For use cases,
	refer to the implementation in <a href="#onyx.Checkbox">onyx.Checkbox</a>.
*/
enyo.kind({
	name: "enyo.common.Checkbox",
	//* @protected
	kind: enyo.Checkbox,
	tag: "div",
	handlers: {
		// prevent double onchange bubble in IE
		onclick: ""
	},
	tap: function(inSender, e) {
		if (!this.disabled) {
			this.setChecked(!this.getChecked());
			this.bubble("onchange");
		}
		return !this.disabled;
	},
	dragstart: function() {
		// Override enyo.Input dragstart handler, to allow drags to propagate for Checkbox
	}
});
