require('enyo');

/**
* Contains the declaration for the {@link enyo.InvertBooleanBinding} kind.
* @module enyo/InvertBooleanBinding
*/

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* An {@link enyo.Binding} designed to invert a {@glossary Boolean} value.
*
* @namespace enyo
* @class enyo.InvertBooleanBinding
* @extends enyo.Binding
* @definedby module:enyo/InvertBooleanBinding
* @public
*/
module.exports = kind(
	/** @lends enyo.InvertBooleanBinding.prototype */ {
	
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
