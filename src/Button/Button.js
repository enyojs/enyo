require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Button~Button} kind.
* @module enyo/Button
*/

var
	kind = require('../kind');
var
	ToolDecorator = require('../ToolDecorator');

/**
* {@link module:enyo/Button~Button} implements an HTML [button]{@glossary button}, with support
* for grouping using {@link module:enyo/Group~Group}.
*
* For more information, see the documentation on
* [Buttons]{@linkplain $dev-guide/building-apps/controls/buttons.html} in the
* Enyo Developer Guide.
*
* @class Button
* @extends module:enyo/ToolDecorator~ToolDecorator
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Button~Button.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Button',
	
	/**
	* @private
	*/
	kind: ToolDecorator,

	/**
	* @private
	*/
	tag: 'button',

	/**
	* @private
	*/
	attributes: {
		/**
		 * Set to `'button'`; otherwise, the default value would be `'submit'`, which
		 * can cause unexpected problems when [controls]{@link module:enyo/Control~Control} are used
		 * inside of a [form]{@glossary form}.
		 * 
		 * @type {String}
		 * @private
		 */
		type: 'button'
	},
	
	/**
	* @private
	*/
	published: 
		/** @lends module:enyo/Button~Button.prototype */ {
		
		/**
		 * When `true`, the [button]{@glossary button} is shown as disabled and does not 
		 * generate tap [events]{@glossary event}.
		 * 
		 * @type {Boolean}
		 * @default false
		 * @public
		 */
		disabled: false
	},
	
	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.disabledChanged();
		};
	}),

	/**
	* @private
	*/
	disabledChanged: function () {
		this.setAttribute('disabled', this.disabled);
	},

	/**
	* @private
	*/
	tap: function () {
		if (this.disabled) {
			// work around for platforms like Chrome on Android or Opera that send
			// mouseup to disabled form controls
			return true;
		} else {
			this.setActive(true);
		}
	},

	// Accessibility

	/**
	* @default button
	* @type {String}
	* @see enyo/AccessibilitySupport~AccessibilitySupport#accessibilityRole
	* @public
	*/
	accessibilityRole: 'button',

	/**
	* When `true`, `aria-pressed` will reflect the state of
	* {@link module:enyo/GroupItem~GroupItem#active}
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	accessibilityPressed: false,

	/**
	* @private
	*/
	ariaObservers: [
		{from: 'disabled', to: 'aria-disabled'},
		{path: ['active', 'accessibilityPressed'], method: function () {
			this.setAriaAttribute('aria-pressed', this.accessibilityPressed ? String(this.active) : null);
		}},
		{from: 'accessibilityRole', to: 'role'}
	]
});
