require('enyo');

/**
* Contains the declaration for the {@link module:enyo/StringBinding~StringBinding} kind.
* @module enyo/StringBinding
*/

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* A {@link module:enyo/Binding~Binding} designed to only propagate a {@glossary String}. If it is not the
* correct type, it will instead propagate an empty {@glossary String}.
*
* @class StringBinding
* @extends module:enyo/Binding~Binding
* @public
*/
module.exports = kind(
	/** @lends module:enyo/StringBinding~StringBinding.prototype */ {
	
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
