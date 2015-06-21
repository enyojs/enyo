require('enyo');

/**
* Contains the declaration for the {@link module:enyo/BooleanBinding~BooleanBinding} kind.
* @module enyo/BooleanBinding
*/

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* An {@link module:enyo/Binding~Binding} that coerces any value passing through it to be a {@glossary Boolean}
* value. Use this by setting the `kind` property of your binding declaration.
*
* @class BooleanBinding
* @extends module:enyo/Binding~Binding
* @public
*/
module.exports = kind(
	/** @lends module:enyo/BooleanBinding~BooleanBinding.prototype */ {
	
	name: 'enyo.BooleanBinding',
	
	/**
	* @private
	*/
	kind: Binding,
	
	/**
	* @private
	*/
	transform: function (value) {
		return !! value;
	}
});
