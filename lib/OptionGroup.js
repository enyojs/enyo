require('enyo');

/**
* Contains the declaration for the {@link enyo.OptionGroup} kind.
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
* {@link enyo.OptionGroup} allows for the [grouping]{@glossary optgroup} of
* [options]{@link enyo.Option} in an {@link enyo.Select} [control]{@link enyo.Control}, 
* and for the disabling of blocks of options.
*
* @namespace enyo
* @class enyo.OptionGroup
* @extends enyo.Control
* @ui
* @definedby module:enyo/OptionGroup
* @public
*/
module.exports = kind(
	/** @lends enyo.OptionGroup.prototype */ {

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
		* The name for this [option group]{@link enyo.OptionGroup}.
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
