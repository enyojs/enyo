require('enyo');

/**
* Contains the declaration for the {@link module:enyo/InputBinding~InputBinding} kind.
* @module enyo/InputBinding
*/

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* An {@link module:enyo/Binding~Binding} designed to have its [source]{@link module:enyo/Binding~Binding#source}
* or its [target]{@link module:enyo/Binding~Binding#target} be an {@link module:enyo/Input~Input}. If the
* `enyo.Input` has a [placeholder]{@link module:enyo/Input~Input#placeholder}, it will be
* used when there is no value. This is a [two-way]{@link module:enyo/Binding~Binding#oneWay} binding.
*
* @class InputBinding
* @extends module:enyo/Binding~Binding
* @public
*/
module.exports = kind(
	/** @lends module:enyo/InputBinding~InputBinding.prototype */ {
	
	name: 'enyo.InputBinding',
	
	/**
	* @private
	*/
	kind: Binding,
	
	/**
	* This should be set to either `'source'` or `'target'` depending on which end is the
	* {@link module:enyo/Input~Input}, so that the [placeholder]{@link module:enyo/InputBinding~InputBinding#placeholder}
	* is not used in the wrong direction.
	*
	* @type {String}
	* @default 'source'
	* @public
	*/
	placeholderDirection: 'source',
	
	/**
	* @private
	*/
	oneWay: false,
	
	/**
	* @private
	*/
	transform: function (value, direction, binding) {
		if (value) { return value; }
		var pd = '_' + binding.placeholderDirection,
			ph = binding[pd] && binding[pd].placeholder || '';
		return ph;
	}
});
