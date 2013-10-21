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
		v = enyo.getPath.call(inMap, name);
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

/**
	Uses the pattern to replace strings according to the pattern. Does not
	follow paths or recurse the map.
*/
enyo.quickReplace = function (text, map, pattern) {
	pattern = pattern || enyo.macroize.pattern;
	var fn = function (token) {
		var r = map[token];
		return r || token;
	};
	return text.replace(pattern, fn);
};

/**
	Similar to _enyo.macroize_, but performs only one iteration of the _replace_
	call. This means that recursive expansion of macros isn't possible, but it
	avoids the extra processing needed to find recursive use.
*/
enyo.quickMacroize = function(inText, inMap, inPattern) {
	var v, result = inText, pattern = inPattern || enyo.macroize.pattern;
	var fn = function(macro, name) {
		if (name in inMap) {
			v = inMap[name];
		} else {
			v = enyo.getPath.call(inMap, name);
		}
		return (v === undefined || v === null) ? "{$" + name + "}" : v;
	};
	result = result.replace(pattern, fn);
	return result;
};

//* @protected

// Matches macros of the form {$name}.
enyo.macroize.pattern = /\{\$([^{}]*)\}/g;
