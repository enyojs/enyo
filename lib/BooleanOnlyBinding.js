require('enyo');

var
	kind = require('./kind');
var
	Binding = require('./Binding');

/**
* An {@link enyo.Binding} that will only propagate changes if the value is a {@glossary Boolean}.
*
* @class enyo.BooleanOnlyBinding
* @extends enyo.Binding
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