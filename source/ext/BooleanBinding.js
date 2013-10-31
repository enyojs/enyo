//*@public
/**
	_enyo.BooleanBinding_ is a binding that will type-cast any truthy or falsey
	value to an explicit boolean value.
*/
enyo.kind({
	name: "enyo.BooleanBinding",
	kind: enyo.Binding,
	//*@protected
	transform: function (value) {
		return !! value;
	}
});

/**
	_enyo.EmptyBinding_ is a binding that will be true for a non-empty string or
	any number, and false for an empty string, null, or undefined. It is commonly
	used to bind from content to a control's showing property.
*/
enyo.kind({
	name: "enyo.EmptyBinding",
	kind: enyo.Binding,
	//*@protected
	transform: function (value) {
		return (value !== "" && value != null);
	}
});
