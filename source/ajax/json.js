(function (enyo, scope) {
	
	/**
	* [JSON]{@glossary JSON} related methods and wrappers.
	*
	* @namespace enyo.json
	* @public
	*/
	enyo.json = /** @lends enyo.json */ {
		
		/**
		* Wrapper for [JSON.stringify]{@glossary JSON.stringify}. Creates a
		* [JSON]{@glossary JSON} [string]{@glossary String} from an
		* [object]{@glossary Object}.
		*
		* @see {@glossary JSON.stringify}
		* @param {Object} value The [object]{@glossary Object} to convert to a
		*	[JSON]{@glossary JSON} [string]{@glossary String}.
		* @param {(Function|String[])} [replacer] An optional parameter indicating either an
		*	[array]{@glossary Array} of keys to include in the final output or a
		*	[function]{@glossary Function} that will have opportunity to dynamically return
		*	values to include for keys.
		* @param {(Number|String)} [space] Determines the spacing (if any) for pretty-printed
		*	output of the [JSON]{@glossary JSON} [string]{@glossary String}. A
		*	[number]{@glossary Number} indicates the number of spaces to use in the output but
		*	a [string]{@glossary String} will be used verbatim.
		* @returns {String} The [JSON]{@glossary JSON} [string]{@glossary String} for the
		*	given [object]{@glossary Object}.
		* @public
		*/
		stringify: function(value, replacer, space) {
			return JSON.stringify(value, replacer, space);
		},
		
		/**
		* Wrapper for [JSON.parse]{@glossary JSON.parse}. Parses a _valid_
		* [JSON]{@glossary JSON} [string]{@glossary String} and returns an
		* [object]{@glossary Object}. It returns `null` if the parameters are invalid.
		*
		* @see {@glossary JSON.parse}
		* @param {String} json The [JSON]{@glossary JSON} [string]{@glossary String} to
		*	parse into an [object]{@glossary Object}.
		* @param {Function} [reviver] The optional [function]{@glossary Function} to use to
		*	parse individual keys of the return [object]{@glossary Object}.
		* @returns {(Object|null)} If _json_ parameters is _valid_ it will return an
		*	[object]{@glossary Object}, otherwise `null`.
		* @public
		*/
		parse: function(json, reviver) {
			return json ? JSON.parse(json, reviver) : null;
		}
	};

})(enyo, this);