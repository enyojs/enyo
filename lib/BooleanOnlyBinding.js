require('enyo');

/**
* Contains the declaration for the {@link enyo.BooleanOnlyBinding} kind.
* @module enyo/BooleanOnlyBinding
*/

var
	kind = require('./kind');
var
	Binding = require('./Binding');

/**
* An {@link enyo.Binding} that will only propagate changes if the value is a {@glossary Boolean}.
*
* @namespace enyo
* @class enyo.BooleanOnlyBinding
* @extends enyo.Binding
* @definedby module:enyo/BooleanOnlyBinding
* @public
*/
module.exports = kind(
	/** @lends enyo.BooleanOnlyBinding.prototype */ {
	
	name: 'enyo.BooleanOnlyBinding',
	
	/**
	* @private
	*/
	kind: Binding,
	
	/**
	* @private
	*/
	transform: function (value, direction, binding) {
		return (typeof value == 'boolean') ? value : binding.stop();
	}
});
