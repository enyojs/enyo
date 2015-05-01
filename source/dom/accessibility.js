var
	kind = require('./kind');

//* Moving to enyo-webos
//
//	/**
//	* _enyo.readAlert_ is the API to use TTS for accessibility VoiceReadout.
//	*
//	* @private
//	*/
//	enyo.readAlert = function(s) {
//
//		if (window.webOS !== undefined && window.webOS.voicereadout !== undefined) {
//			window.webOS.voicereadout.readAlert(s);
//		}
//
//	};

//* Moving to Control
//
//	if (enyo.options.accessibility) {
//		enyo.Control.extend();
//	}

/**
* @name AccessibilityMixin
* @mixin
*/
module.exports = {

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
	* @private
	*/
	initAccessibility: function () {
		this.observe('content', 'updateAriaAttributes', this);
		this.observe('accessibilityLabel', 'updateAriaAttributes', this);
		this.observe('accessibilityHint', 'updateAriaAttributes', this);

		this.updateAriaAttributes();

		if (this.accessibilityAlert) {
			this.accessibilityAlertChanged();
		}

		if (this.accessibilityLive) {
			this.accessibilityLiveChanged();
		}
	},

	updateAriaAttributes: function () {
		var prefix = this.accessibilityLabel || this.content;
		var label = this.accessibilityHint;

		if (label && prefix) {
			label = prefix + ' ' + label;
		}

		this.setAttribute('tabindex', label ? 0 : null);
		this.setAttribute('aria-label', label || null);
	},

	/**
	* @private
	*/
	accessibilityAlertChanged: function () {
		this.setAttribute('role', this.accessibilityAlert ? 'alert' : null);
	},

	/**
	* @private
	*/
	accessibilityLiveChanged: function () {
		this.setAttribute('aria-live', this.accessibilityLive ? 'assertive' : null);
	}
};