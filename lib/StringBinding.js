require('enyo');

/**
* Contains the declaration for the {@link enyo.StringBinding} kind.
* @module enyo/StringBinding
*/

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* A {@link enyo.Binding} designed to only propagate a {@glossary String}. If it is not the
* correct type, it will instead propagate an empty {@glossary String}.
*
* @namespace enyo
* @class enyo.StringBinding
* @extends enyo.Binding
* @definedby module:enyo/StringBinding
* @public
*/
module.exports = kind(
	/** @lends enyo.StringBinding.prototype */ {
	
	name: 'enyo.StringBinding',
	
	/**
	* @private
	*/
	kind: Binding,
	
	/**
	* @private
	*/
	transform: function (value) {
		return (typeof value == 'string') ? value : '';
	}
});
