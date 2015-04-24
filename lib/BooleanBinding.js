require('enyo');

/**
* Contains the declaration for the {@link enyo.BooleanBinding} kind.
* @module enyo/BooleanBinding
*/

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* An {@link enyo.Binding} that coerces any value passing through it to be a {@glossary Boolean}
* value. Use this by setting the `kind` property of your binding declaration.
*
* @namespace enyo
* @class enyo.BooleanBinding
* @extends enyo.Binding
* @definedby module:enyo/BooleanBinding
* @public
*/
module.exports = kind(
	/** @lends enyo.BooleanBinding.prototype */ {
	
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
