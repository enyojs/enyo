/**
	_enyo.TextArea_ implements an HTML &lt;textarea&gt; element with
	cross-platform support for change events.

	For more information, see the documentation on
	[Text Fields](https://github.com/enyojs/enyo/wiki/Text-Fields) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.TextArea",
	kind: enyo.Input,
	//* @protected
	tag: "textarea",
	classes: "enyo-textarea",
	// textarea does use value attribute; needs to be kicked when rendered.
	rendered: function() {
		this.inherited(arguments);
		this.valueChanged();
	}
});
