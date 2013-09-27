//*@public
/**
	_enyo.InputBinding_ is a binding designed to have its source or target be an
	_input_ with an optional _placeholder_ value. This keeps the input from
	showing _undefined_ when there is no content, as the _placeholder_ value will
	then be used for display.
*/
enyo.kind({
	name: "enyo.InputBinding",
	kind: enyo.Binding,
	/**
		The direction priority for the placeholder text so it is not propagated when
		an empty string should be.
	*/
	placeholderDirection: "source",
	oneWay: false,
	//*@protected
	transform: function (value, direction, binding) {
		if (value) { return value; }
		var pd = binding.placeholderDirection,
			ph = binding[pd].placeholder || "";
		return ph;
	}
});
