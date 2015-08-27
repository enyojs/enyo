require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Checkbox~Checkbox} kind.
* @module enyo/Checkbox
*/

var
	kind = require('../kind'),
	utils = require('../utils'),
	platform = require('../platform');
var
	Input = require('../Input');

/**
* Fires when checkbox is tapped.
*
* @event module:enyo/Checkbox~Checkbox#onActivate
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* {@link module:enyo/Checkbox~Checkbox} implements an HTML checkbox [input]{@glossary input}, with
* support for grouping using {@link module:enyo/Group~Group}.
*
* @class Checkbox
* @extends module:enyo/Input~Input
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Checkbox~Checkbox.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Checkbox',

	/**
	* @private
	*/
	kind: Input,

	/**
	* @private
	*/
	classes: 'enyo-checkbox',

	/**
	* @private
	*/
	events: {
		onActivate: ''
	},

	/**
	* @private
	*/
	published: 
		/** @lends module:enyo/Checkbox~Checkbox.prototype */ {
		
		/**
		* Value of the checkbox; will be `true` if checked.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		checked: false,
		
		/**
		* A [Group API]{@link module:enyo/Group~Group} requirement for determining the selected item.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		active: false,
		
		/**
		* @private
		*/
		type: 'checkbox'
	},
	
	/**
	* Disable classes inherited from {@link module:enyo/Input~Input}.
	* 
	* @private
	*/
	kindClasses: "",

	/**
	* @private
	*/
	handlers: {
		onchange: 'change',
		onclick: 'click'
	},

	/**
	* @method
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			if (this.active) {
				this.activeChanged();
			}
			this.checkedChanged();
		};
	}),

	/**
	* @private
	*/
	checkedChanged: function () {
		this.setNodeProperty('checked', this.checked);
		this.setAttribute('checked', this.checked ? 'checked' : '');
		this.setActive(this.checked);
	},

	/**
	* The [active]{@link module:enyo/Checkbox~Checkbox#active} property and `onActivate`
	* {@glossary event} are part of the [GroupItem]{@link module:enyo/GroupItem~GroupItem}
	* interface supported by this [object]{@glossary Object}.
	* 
	* @private
	*/
	activeChanged: function () {
		this.active = utils.isTrue(this.active);
		this.setChecked(this.active);
		this.bubble('onActivate');
	},

	/**
	* All [input]{@link module:enyo/Input~Input} type [controls]{@link module:enyo/Control~Control} support the 
	* [value]{@link module:enyo/Input~Input#value} property.
	*
	* @param {Boolean} val - Whether or not the [checkbox]{@link module:enyo/Checkbox~Checkbox} should
	* be checked. The value will be treated as `true` if it is truthy; otherwise,
	* `false`.
	* @public
	*/
	setValue: function (val) {
		this.setChecked(utils.isTrue(val));
	},

	/**
	* Retrieves the current [value]{@link module:enyo/Input~Input#value} of the
	* [checkbox]{@link module:enyo/Checkbox~Checkbox}.
	*
	* @returns {Boolean} `true` if the [checkbox]{@link module:enyo/Checkbox~Checkbox} is checked;
	* otherwise, `false`.
	* @public
	*/
	getValue: function () {
		return this.getChecked();
	},

	/**
	* @private
	*/
	valueChanged: function () {

	/**
	* @private
	*/
	// inherited behavior is to set "value" attribute and node-property
	// which does not apply to checkbox (uses "checked") so
	// we squelch the inherited method
	},
	change: function () {
		var nodeChecked = utils.isTrue(this.getNodeProperty('checked'));
		this.setActive(nodeChecked);
	},

	/**
	* @private
	*/
	click: function (sender, e) {
		// Various versions of IE (notably IE8) do not fire 'onchange' for
		// checkboxes, so we discern change via 'click'.
		// Note: keyboard interaction (e.g. pressing space when focused) fires
		// a click event.
		if (platform.ie <= 8) {
			this.bubble('onchange', e);
		}
	},

	// Accessibility

	/**
	* @default checkbox
	* @type {String}
	* @see enyo/AccessibilitySupport~AccessibilitySupport#accessibilityRole
	* @public
	*/
	accessibilityRole: 'checkbox',

	/**
	* @private
	*/
	ariaObservers: [
		{from: 'checked', to: 'aria-checked'}
	]
});
