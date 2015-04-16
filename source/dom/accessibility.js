(function (enyo, scope) {

	if (enyo.options.accessibility) {
		enyo.Control.extend(
			/** @lends enyo.Control.prototype */ {

			/**
			* @private
			*/
			contentChanged: enyo.inherit(function (sup) {
				return function (control) {
					sup.apply(this, arguments);

					// Accessibility : Set aria-label to current content 
					// when content changed.
					if (this.content) {
						this.setAttribute('tabindex', 0);
						this.setAttribute('aria-label', this.content);
					}
				};
			})
		});
	}
})(enyo, this);
