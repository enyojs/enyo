var
	kind = require('../kind');

/**
* @name GroupAccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	observers: [
		{method: 'updateAccessibilityAttributes', path: 'active'}
	],

	/**
	* @private
	*/
	updateAccessibilityAttributes: kind.inherit(function (sup) {
		return function (was, is, prop) {
			var enabled = !this.accessibilityDisabled;
			sup.apply(this, arguments);
			this.setAttribute('role', enabled ? 'group' : null);
			this.setAttribute('tabindex', enabled ? 0 : null);
			this.setAttribute('aria-activedescendant', this.active && enabled ? this.active.getId() : null);
		};
	}),

	/**
	* @private
	*/
	activeChanged: kind.inherit(function (sup) {
		return function (was, is, prop) {
			var enabled = !this.accessibilityDisabled;
			sup.apply(this, arguments);
			if (was && !was.destroyed && (was.getAttribute('role') === 'button')) {
				was.setAttribute('aria-pressed', enabled ? String(was.active) : null);
			}
			if (this.active && (this.active.getAttribute('role') === 'button')) {
				this.active.setAttribute('aria-pressed', enabled ? String(this.active.active) : null);
			}
		};
	}),

	/**
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function (was, is, prop) {
			var enabled = !this.accessibilityDisabled,
				i = 0;
			sup.apply(this, arguments);
			for (; i < this.controls.length; ++i) {
				this.controls[i].setAttribute('aria-pressed', enabled && (this.controls[i].getAttribute('role') === 'button') ? String(this.controls[i].active) : null);
			}
		};
	})
};