(function (enyo, scope) {

	/**
	* Populates a {@glossary String} template with values from an {@glossary Object}. Can be used
	* with custom _macro_ patterns.
	*
	* The default _macro_ pattern is of the form `{$name}`.
	*
	* ```javascript
	* // returns 'My name is Barney.'
	* enyo.macroize('My name is {$name}.', {name: 'Barney'});
	* ```
	*
	* Dot notation is supported like so:
	*
	* ```javascript
	* var info = {
	* 	product_0: {
	* 		name: 'Gizmo',
	* 		weight: 3
	* 	}
	* };
	*
	* // returns 'Each Gizmo weighs 3 pounds.'
	* enyo.macroize('Each {$product_0.name} weighs {$product_0.weight} pounds.', info);
	* ```
	*
	* @utility
	* @param {String} text The template text from which to replace via _macro_.
	* @param {Object} map The {@glossary Object} from which to find the data to insert into the
	*	_text_.
	* @param {RegExp} [regex] The optional _pattern_ to use to match the entries in the _text_.
	* @returns {String} The modified _text_ value.
	* @public
	*/
	enyo.macroize = function (text, map, regex) {
		var v, working, result = text, pattern = regex || enyo.macroize.pattern;
		var fn = function(macro, name) {
			v = enyo.getPath.call(map, name);
			if (v === undefined || v === null) {
				return '{$' + name + '}';
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
				throw('enyo.macroize: recursion too deep');
			}
		} while (working);
		return result;
	};

	/**
	* Uses a {@glossary RegExp} pattern to replace tokens in a {@glossary String}. This is just like
	* {@link enyo.macroize} except it does not support nested structures (dot notation).
	*
	* @utility
	* @see enyo.macroize
	* @param {String} text The template text from which to replace via _macro_.
	* @param {Object} map The {@glossary Object} from which to find the data to insert into the
	*	_text_.
	* @param {RegExp} [regex] The optional _pattern_ to use to match the entries in the _text_.
	* @returns {String} The modified _text_ value.
	* @public
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
	* A non-recursing version of {@link enyo.macroize}. This means it will not expand the same
	* _macro_ more than once in the {@glossary String}, but it is much more efficient.
	*
	* @utility
	* @see enyo.macroize
	* @param {String} text The template text from which to replace via _macro_.
	* @param {Object} map The {@glossary Object} from which to find the data to insert into the
	*	_text_.
	* @param {RegExp} [regex] The optional _pattern_ to use to match the entries in the _text_.
	* @returns {String} The modified _text_ value.
	* @public
	*/
	enyo.quickMacroize = function(text, map, regex) {
		var v, result = text, pattern = regex || enyo.macroize.pattern;
		var fn = function(macro, name) {
			if (name in map) {
				v = map[name];
			} else {
				v = enyo.getPath.call(map, name);
			}
			return (v === undefined || v === null) ? '{$' + name + '}' : v;
		};
		result = result.replace(pattern, fn);
		return result;
	};

	/**
	* The default {@glossary RegExp} _macro_ pattern used by {@link enyo.macroize},
	* {@link enyo.quickReplace} and {@link enyo.quickMacroize}. Matches _macros_ of the form
	* `{$name}`.
	*
	* @type {RegExp}
	* @default '/\{\$([^{}]*)\}/g'
	* @public
	*/
	enyo.macroize.pattern = /\{\$([^{}]*)\}/g;

})(enyo, this);