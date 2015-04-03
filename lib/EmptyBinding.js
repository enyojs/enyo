require('enyo');

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* An {@link enyo.Binding} that checks for empty values. Will be `true` if there is some
* value, but `false` for an empty [string]{@glossary String}, `null`, or `undefined`.
*
* @class enyo.EmptyBinding
* @extends enyo.Binding
* @public
*/
module.exports = kind(
	/** @lends enyo.EmptyBinding.prototype */ {
	
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