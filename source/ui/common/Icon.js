/**
	_enyo.common.Icon_ is the base kind for stylized icon controls that live in external
	sources. It contains common properties/methods that are shared between multiple
	libraries.

	It is not intended for an _enyo.common.Icon_ to be used directly. For use cases,
	refer to the implementation in <a href="#onyx.Icon">onyx.Icon</a>.
*/
enyo.kind({
	name: "enyo.common.Icon",
	published: {
		//* URL specifying path to icon image
		src: "",
		//* When true, icon is shown as disabled.
		disabled: false
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		if (this.src) {
			this.srcChanged();
		}
		this.disabledChanged();
	},
	disabledChanged: function() {
		this.addRemoveClass("disabled", this.disabled);
	},
	srcChanged: function() {
		this.applyStyle("background-image", "url(" + enyo.path.rewrite(this.src) + ")");
	}
});