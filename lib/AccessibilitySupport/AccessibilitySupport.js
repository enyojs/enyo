var
	kind = require('../kind');

/**
* @name AccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	name: 'enyo.AccessibilitySupport',

	/**
	* AccessibilityLabel is used for accessibility voice readout.
	* If accessibilityLabel is set, screen reader reads the label when control is focused.
	*
	* @type {String}
	* @default ''
	* @public
	*/
	accessibilityLabel: '',

	/**
	* AccessibilityHint is used for additional information of control.
	* If accessibilityHint is set and content exists, screen reader
	* reads accessibilityHint with content when control is focused.
	*
	* @type {String}
	* @default ''
	* @public
	*/
	accessibilityHint: '',

	/**
	* AccessibilityAlert is for alert message or page description.
	* If accessibilityAlert is true, aria role will be set to "alert" and
	* screen reader will automatically reads content or accessibilityLabel
	* regardless focus.
	* Note that if you use accessibilityAlert, previous role will be
	* replaced with "alert" role.
	*
	* Range: [`true`, `false`]
	* - true: screen reader automatically reads label regardless focus.
	* - false: screen reader reads label with focus.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	accessibilityAlert: false,

	/**
	* AccessibilityLive is for dynamic content which updates without a page reload.
	* If AccessibilityLive is true, screen reader will read content or accessibilityLabel
	* when it changed.
	*
	* Range: [`true`, `false`]
	* - true: screen reader reads content when it changed.
	* - false: screen reader reads content with focus.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	accessibilityLive: false,

	/**
	* AccessibilityDisabled prevents VoiceReadout.
	* If accessibilityDisabled is true, screen reader doesn't read any label for the control.
	* Note that this is not working on HTML form elements which can get focus without tabindex.
	*
	* Range: [`true`, `false`]
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	accessibilityDisabled: false,

	/**
	* @private
	*/
	observers: [
		{method: 'updateAccessibilityAttributes', path: [
			'content',
			'accessibilityHint',
			'accessibilityLabel',
			'accessibilityAlert',
			'accessibilityLive',
			'accessibilityDisabled'
		]}
	],

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.initAccessibility();
		};
	}),

	/**
	* One-time intialization logic for control accessibility should be done here. By default, it
	* invokes the accessibility property observer,
	* {@link AccessibilityMixin#updateAccessibilityAttributes}
	*
	* @protected
	*/
	initAccessibility: function () {
		this.updateAccessibilityAttributes();
	},

	/**
	* Observes changes on properties that affect the accessibility attributes. Control-specific
	* accessibility mixins should add an observer block for any additional properties.
	*
	* ```javascript
	* observers: [
	* 	{method: 'updateAccessibilityAttributes', path: 'checked'}
	* ],
	*
	* updateAccessibilityAttributes: kind.inherit(function (sup) {
	* 	return function (was, is, prop) {
	* 		var enabled = !this.accessibilityDisabled;
	* 		sup.apply(this, arguments);
	* 		this.setAttribute('aria-checked', enabled && this.checked || null);
	* 	};
	* });
	* ```
	*
	* @protected
	*/
	updateAccessibilityAttributes: function (was, is, prop) {
		var enabled = !this.accessibilityDisabled,
			focusable = this.accessibilityLabel || this.content || this.accessibilityHint || null,
			prefix = this.accessibilityLabel || this.content || null,
			label = this.accessibilityHint && prefix && (prefix + ' ' + this.accessibilityHint) ||
					this.accessibilityHint ||
					this.accessibilityLabel ||
					null;

		this.setAttribute('tabindex', focusable && enabled ? 0 : null);
		this.setAttribute('aria-label', enabled ? label : null);
		this.setAttribute('role', this.accessibilityAlert && enabled ? 'alert' : null);
		this.setAttribute('aria-live', this.accessibilityLive && enabled ? 'assertive' : null);
		this.setAttribute('aria-hidden', enabled ? null : 'true');
	},
};
