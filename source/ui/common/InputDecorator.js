/**
	_enyo.common.InputDecorator_ is the base kind for stylized input-decorator controls that live in external
	sources. It contains common properties/methods that are shared between multiple
	libraries.

	It is not intended for an _enyo.common.InputDecorator_ to be used directly. For use cases,
	refer to the implementation in <a href="#onyx.InputDecorator">onyx.InputDecorator</a>.
*/
enyo.kind({
	name: "enyo.common.InputDecorator",
	kind: "enyo.ToolDecorator",
	tag: "label",
	published:{
		//* Set to true to make the input look focused when it's not.
		alwaysLooksFocused:false
	},
	//* @protected
	handlers: {
		onDisabledChange: "disabledChange",
		onfocus: "receiveFocus",
		onblur: "receiveBlur"
	},
	create:function() {
		this.inherited(arguments);
		this.updateFocus(false);
	},
	alwaysLooksFocusedChanged:function(oldValue) {
		this.updateFocus(this.focus);
	},
	updateFocus:function(focus) {
		this.focused = focus;
		this.addRemoveClass("enyo-focused", this.alwaysLooksFocused || this.focused);
	},
	receiveFocus: function() {
		this.updateFocus(true);
	},
	receiveBlur: function() {
		this.updateFocus(false);
	},
	disabledChange: function(inSender, inEvent) {
		this.addRemoveClass("enyo-disabled", inEvent.originator.disabled);
	}
});