//*@public
/**
	_enyo.BooleanOnlyBinding_ is a binding that will only continue propagation
	if the value being passed is an explicit boolean value.
*/
enyo.kind({
	name: "enyo.BooleanOnlyBinding",
	kind: enyo.Binding,
	//*@protected
	transform: function (value, direction, binding) {
		if (value !== true && value !== false) {
			return undefined;
		}
		return value;
	}
});
