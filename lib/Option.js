require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Option~Option} kind.
* @module enyo/Option
*/

var
	kind = require('./kind');
var
	Control = require('./Control');

/**
* {@link module:enyo/Option~Option} implements the [options]{@glossary option} in an
* {@link module:enyo/Select~Select} [control]{@link module:enyo/Control~Control}.
*
* @class Option
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Option~Option.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Option',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	published: {
		/**
		* Value of the [option]{@link module:enyo/Option~Option}.
		* 
		* @type {String}
		* @default ''
		* @memberof enyo.Option.prototype
		* @public
		*/
		value: '',

		/**
		* Set to `true` if this [option]{@link module:enyo/Option~Option} is selected (default is `false`).
		* 
		* @type {Boolean}
		* @default false
		* @memberof enyo.Option.prototype
		* @public
		*/
		selected: false
	},
	
	/**
	* @private
	*/
	tag: 'option',

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.valueChanged();
			this.selectedChanged();
		};
	}),

	/**
	* @private
	*/
	valueChanged: function () {
		this.setAttribute('value', this.value);
	},

	/**
	* @private
	*/
	selectedChanged: function () {
		this.setAttribute('selected', this.selected);
	}
});
