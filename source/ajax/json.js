(function (enyo, scope) {
	
	/**
	* [JSON]{@link external:JSON} related methods and wrappers.
	*
	* @namespace enyo.json
	* @public
	*/
	enyo.json = /** @lends enyo.json */ {
		
		/**
		* Wrapper for [JSON.stringify]{@link external:JSON.stringify}. Creates a
		* [JSON]{@link external:JSON} [string]{@link external:String} from an
		* [object]{@link external:Object}.
		*
		* @see {@link external:JSON.stringify}
		* @param {Object} value The [object]{@link external:Object} to convert to a
		*	[JSON]{@link external:JSON} [string]{@link external:String}.
		* @param {(Function|String[])} [replacer] An optional parameter indicating either an
		*	[array]{@link external:Array} of keys to include in the final output or a
		*	[function]{@link external:Function} that will have opportunity to dynamically return
		*	values to include for keys.
		* @param {(Number|String)} [space] Determines the spacing (if any) for pretty-printed
		*	output of the [JSON]{@link external:JSON} [string]{@link external:String}. A
		*	[number]{@link external:Number} indicates the number of spaces to use in the output but
		*	a [string]{@link external:String} will be used verbatim.
		* @returns {String} The [JSON]{@link external:JSON} [string]{@link external:String} for the
		*	given [object]{@link external:Object}.
		* @public
		*/
		stringify: function(value, replacer, space) {
			return JSON.stringify(value, replacer, space);
		},
		
		/**
		* Wrapper for [JSON.parse]{@link external:JSON.parse}. Parses a _valid_
		* [JSON]{@link external:JSON} [string]{@link external:String} and returns an
		* [object]{@link external:Object}. It returns `null` if the parameters are invalid.
		*
		* @see {@link external:JSON.parse}
		* @param {String} json The [JSON]{@link external:JSON} [string]{@link external:String} to
		*	parse into an [object]{@link external:Object}.
		* @param {Function} [reviver] The optional [function]{@link external:Function} to use to
		*	parse individual keys of the return [object]{@link external:Object}.
		* @returns {(Object|null)} If _json_ parameters is _valid_ it will return an
		*	[object]{@link external:Object}, otherwise `null`.
		* @public
		*/
		parse: function(json, reviver) {
			return json ? JSON.parse(json, reviver) : null;
		}
	};

})(enyo, this);