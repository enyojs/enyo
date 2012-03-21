/**
	Implements an HTML textarea element with cross platform support for change events
*/
enyo.kind({
	name: "enyo.TextArea",
	kind: enyo.Input,
	//* @protected
	tag: "textarea",
	classes: "enyo-textarea",
	// textarea does use value attribute, needs to be kicked when rendered
	rendered: function() {
		this.inherited(arguments);
		this.valueChanged();
	}
});
