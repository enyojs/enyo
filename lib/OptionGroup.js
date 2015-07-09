require('enyo');

/**
* Contains the declaration for the {@link module:enyo/OptionGroup~OptionGroup} kind.
* @module enyo/OptionGroup
*/

var
	kind = require('./kind');
var
	Control = require('./Control'),
	/*jshint -W079*/
	Option = require('./Option');
	/*jshint +W079*/

/**
* {@link module:enyo/OptionGroup~OptionGroup} allows for the [grouping]{@glossary optgroup} of
* [options]{@link module:enyo/Option~Option} in an {@link module:enyo/Select~Select} [control]{@link module:enyo/Control~Control}, 
* and for the disabling of blocks of options.
*
* @class OptionGroup
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/OptionGroup~OptionGroup.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.OptionGroup',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	published: {
		/**
		* The name for this [option group]{@link module:enyo/OptionGroup~OptionGroup}.
		* 
		* @type {String}
		* @default ''
		* @memberof enyo.OptionGroup.prototype
		* @public
		*/
		label: ''
	},
	
	/**
	* @private
	*/
	tag: 'optgroup',

	/**
	* @private
	*/
	defaultKind: Option,

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.labelChanged();
		};
	}),

	/**
	* @private
	*/
	labelChanged: function () {
		this.setAttribute('label', this.label);
	}
});
