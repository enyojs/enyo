//*@public
/**
	This binding is designed to work with its source or target
	being an _input_ with an optional _placeholder_ value. This
	will keep an input from showing an ugly undefined when there
	is no content and instead propagate the _placeholder_ value
	to the opposite end.
*/
enyo.kind({
	name: "enyo.InputBinding",
	kind: enyo.Binding,
	oneWay: false,
	//*@protected
	transform: function (value, direction, binding) {
		if (value) { return value; }
		var s = binding.source || {},
			t = binding.target || {},
			// we attempt to find the placeholder at either end prioritizing
			// to checking the source 
			ph = source.placeholder || t.placeholder || "";
		return ph;
	}
});
