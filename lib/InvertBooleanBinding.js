require('enyo');

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* An {@link enyo.Binding} designed to invert a {@glossary Boolean} value.
*
* @class enyo.InvertBooleanBinding
* @extends enyo.Binding
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