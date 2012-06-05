//* @public

/**
	Populates a string template with data values.

	Returns a copy of _inText_, with macros defined by _inPattern_ replaced by
	named values in _inMap_.

	_inPattern_ may be omitted, in which case the default macro pattern is used. 
	The default pattern matches macros of the form

		{$name}

	Example:

		// Returns "My name is Barney."
		enyo.macroize("My name is {$name}.", {name: "Barney"});

	Dot notation is supported, like so:

		var info = {
			product_0: {
				name: "Gizmo"
				weight: 3
			}
		}
		// Returns "Each Gizmo weighs 3 pounds."
		enyo.macroize("Each {$product_0.name} weighs {$product_0.weight} pounds.", info);
*/
enyo.macroize = function(inText, inMap, inPattern) {
	var v, working, result = inText, pattern = inPattern || enyo.macroize.pattern;
	var fn = function(macro, name) {
		v = enyo.getObject(name, false, inMap);
		if (v === undefined || v === null) {
			return "{$" + name + "}";
		}
		working = true;
		return v;
	};
	var prevent = 0;
	do {
		working = false;
		result = result.replace(pattern, fn);
		// if iterating more than 20 times, we assume a recursion (we should probably throw)
		if (++prevent >= 20) {
			throw("enyo.macroize: recursion too deep");
		}
	} while (working);
	return result;
};

enyo.quickMacroize = function(inText, inMap, inPattern) {
	var v, working, result = inText, pattern = inPattern || enyo.macroize.pattern;
	var fn = function(macro, name) {
		if (name in inMap) {
			v = inMap[name];
		} else {
			v = enyo.getObject(name, false, inMap);
		}
		return (v === undefined || v === null) ? "{$" + name + "}" : v;
	};
	result = result.replace(pattern, fn);
	return result;
};

//* @protected

// matches macros of form {$name}
enyo.macroize.pattern = /\{\$([^{}]*)\}/g;
