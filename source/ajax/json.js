enyo.json = {
	//* @public
	/**
		Returns a JSON string for a given object, using native stringify
		routine.
		<i>inValue</i> is the Object to be converted to JSON.
		<i>inReplacer</i> is the optional value inclusion array or replacement function.
		<i>inSpace</i> is the optional number or string to use for pretty-printing whitespace.
	*/
	stringify: function(inValue, inReplacer, inSpace) {
		return JSON.stringify(inValue, inReplacer, inSpace);
	},
	/**
		Returns a JavaScript object for a given JSON string, using native stringify
		routine.
		<i>inJson</i> is the JSON string to be converted to a JavaScript object.
		<i>reviver</i> is an optional function parameter that takes two parameters, (key and value).
		It can filter and transform the results. It is called with each of the key/value pairs produced
		by the parse, and its return value is used instead of the original value.
		If it returns what it received, the structure is not modified.
		If it returns undefined then the property is deleted from the result.
	*/
	parse: function(inJson, reviver) {
		return inJson ? JSON.parse(inJson, reviver) : null;
	}
};
