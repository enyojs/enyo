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
	*/
	parse: function(inJson, inReviver) {
		return inJson ? JSON.parse(inJson, inReviver) : null;
	}
};
