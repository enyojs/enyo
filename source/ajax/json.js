(function (enyo, scope) {
	
	/**
	* [JSON]{@glossary JSON} related methods and wrappers.
	*
	* @namespace enyo.json
	* @public
	*/
	enyo.json = /** @lends enyo.json */ {
		
		/**
		* Wrapper for [JSON.stringify()]{@glossary JSON.stringify}. Creates a
		* [JSON]{@glossary JSON} [string]{@glossary String} from an
		* [object]{@glossary Object}.
		*
		* @see {@glossary JSON.stringify}
		* @param {Object} value - The [object]{@glossary Object} to convert to a
		*	[JSON]{@glossary JSON} [string]{@glossary String}.
		* @param {(Function|String[])} [replacer] An optional parameter indicating either an
		*	[array]{@glossary Array} of keys to include in the final output or a
		*	[function]{@glossary Function} that will have the opportunity to dynamically return
		*	values to include for keys.
		* @param {(Number|String)} [space] - Determines the spacing (if any) for pretty-printed
		*	output of the JSON string. A [number]{@glossary Number} indicates the number of
		* spaces to use in the output, while a string will be used verbatim.
		* @returns {String} The JSON string for the given object.
		* @public
		*/
		stringify: function(value, replacer, space) {
			return JSON.stringify(value, replacer, space);
		},
		
		/**
		* Wrapper for [JSON.parse()]{@glossary JSON.parse}. Parses a valid
		* [JSON]{@glossary JSON} [string]{@glossary String} and returns an
		* [object]{@glossary Object}, or `null` if the parameters are invalid.
		*
		* @see {@glossary JSON.parse}
		* @param {String} json - The [JSON]{@glossary JSON} [string]{@glossary String} to
		*	parse into an [object]{@glossary Object}.
		* @param {Function} [reviver] - The optional [function]{@glossary Function} to use to
		*	parse individual keys of the return object.
		* @returns {(Object|null)} If parameters are valid, an [object]{@glossary Object}
		* is returned; otherwise, `null`.
		* @public
		*/
		parse: function(json, reviver) {
			return json ? JSON.parse(json, reviver) : null;
		}
	};

})(enyo, this);