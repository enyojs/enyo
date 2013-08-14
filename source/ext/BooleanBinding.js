//*@public
/**
	_enyo.BooleanBinding_ is a binding that will type-cast any truthy or falsey
	value to an explicit boolean value.
*/
enyo.kind({
	name: "enyo.BooleanBinding",
	kind: enyo.Binding,
	//*@protected
	transform: function (value, direction, binding) {
		return !! value;
	}
});
