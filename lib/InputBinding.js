require('enyo');

/**
* Contains the declaration for the {@link enyo.InputBinding} kind.
* @module enyo/InputBinding
*/

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* An {@link enyo.Binding} designed to have its [source]{@link enyo.Binding#source}
* or its [target]{@link enyo.Binding#target} be an {@link enyo.Input}. If the
* `enyo.Input` has a [placeholder]{@link enyo.Input#placeholder}, it will be
* used when there is no value. This is a [two-way]{@link enyo.Binding#oneWay} binding.
*
* @namespace enyo
* @class enyo.InputBinding
* @extends enyo.Binding
* @definedby module:enyo/InputBinding
* @public
*/
module.exports = kind(
	/** @lends enyo.InputBinding.prototype */ {
	
	name: 'enyo.InputBinding',
	
	/**
	* @private
	*/
	kind: Binding,
	
	/**
	* This should be set to either `'source'` or `'target'` depending on which end is the
	* {@link enyo.Input}, so that the [placeholder]{@link enyo.InputBinding#placeholder}
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
