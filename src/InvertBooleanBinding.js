require('enyo');

/**
* Contains the declaration for the {@link module:enyo/InvertBooleanBinding~InvertBooleanBinding} kind.
* @module enyo/InvertBooleanBinding
*/

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* An {@link module:enyo/Binding~Binding} designed to invert a {@glossary Boolean} value.
*
* @class InvertBooleanBinding
* @extends module:enyo/Binding~Binding
* @public
*/
module.exports = kind(
	/** @lends module:enyo/InvertBooleanBinding~InvertBooleanBinding.prototype */ {
	
	name: 'enyo.InvertBooleanBinding',
	
	/**
	* @private
	*/
	kind: Binding,
	
	/**
	* @private
	*/
	transform: function (value) {
		return ! value;
	}
});
