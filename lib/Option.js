require('enyo');

var
	kind = require('./kind');
var
	Control = require('./Control');

/**
* {@link enyo.Option} implements the [options]{@glossary option} in an
* {@link enyo.Select} [control]{@link enyo.Control}.
*
* @class enyo.Option
* @extends enyo.Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends enyo.Option.prototype */ {

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
		* Value of the [option]{@link enyo.Option}.
		* 
		* @type {String}
		* @default ''
		* @memberof enyo.Option.prototype
		* @public
		*/
		value: '',

		/**
		* Set to `true` if this [option]{@link enyo.Option} is selected (default is `false`).
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