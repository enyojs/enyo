require('enyo');

/**
* Contains the declaration for the {@link module:enyo/EmptyBinding~EmptyBinding} kind.
* @module enyo/EmptyBinding
*/

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* An {@link module:enyo/Binding~Binding} that checks for empty values. Will be `true` if there is some
* value, but `false` for an empty [string]{@glossary String}, `null`, or `undefined`.
*
* @class EmptyBinding
* @extends module:enyo/Binding~Binding
* @public
*/
module.exports = kind(
	/** @lends module:enyo/EmptyBinding~EmptyBinding.prototype */ {
	
	name: 'enyo.EmptyBinding',
	
	/**
	* @private
	*/
	kind: Binding,
	
	/**
	* @private
	*/
	transform: function (value) {
		return (value !== '' && value != null);
	}
});
