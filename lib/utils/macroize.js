//* @public

/**
	Populates a string template with data values.

	Returns a copy of _inText_, with macros defined by _inPattern_ replaced by
	named values in _inMap_.

	_inPattern_ may be omitted, in which case the default macro pattern is used. 
	The default pattern matches macros of the form

		{$name}

	Example:

		// returns "My name is Barney."
		enyo.macroize("My name is {$name}.", {name: "Barney"});

	Dot notation is supported, like so:

		var info = {
			product_0: {
				name: "Gizmo"
				weight: 3
			}
		}
		// returns "Each Gizmo weighs 3 pounds."
		enyo.macroize("Each {$product_0.name} weighs {$product_0.weight} pounds.", info);
*/
enyo.macroize = function(inText, inMap, inPattern) {
	var v, working, result = inText, pattern = inPattern || enyo.macroize.pattern;
	var fn = function(macro, name) {
		working = true;
		v = enyo.getObject(name, false, inMap);
		//v = inMap[name];
		return (v === undefined || v === null) ? "{$" + name + "}" : v;
	};
	var prevent = 0;
	do {
		working = false;
		result = result.replace(pattern, fn);
	// if iterating more than 100 times, we assume a recursion (we should throw probably)
	} while (working && (prevent++ < 100));
	return result;
};

//* @protected

// matches macros of form {$name}
enyo.macroize.pattern = /{\$([^{}]*)}/g;
