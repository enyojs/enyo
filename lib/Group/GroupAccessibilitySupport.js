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
	activate: kind.inherit(function (sup) {
		return function (sender, e) {
			var enabled = !this.accessibilityDisabled;
			sup.apply(this, arguments);
			if ((this.groupName || e.originator.groupName) && (e.originator.groupName != this.groupName)) {
				return;
			}
			if (this.highlander) {
				if (!e.originator.active) {
					e.originator.setAttribute('aria-pressed', enabled ? 'false' : null);
					if (e.originator == this.active) {
						if (!this.allowHighlanderDeactivate) {
							this.active.setAttribute('aria-pressed', enabled ? 'true' : null);
						}
					}
				} else {
					e.originator.setAttribute('aria-pressed', enabled ? 'true' : null);
				}
			}
		};
	})
};