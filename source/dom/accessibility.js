(function (enyo, scope) {

	if (enyo.options.accessibility) {
		enyo.Control.extend(
			/** @lends enyo.Control.prototype */ {

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
			* @method
			* @private
			*/
			create: enyo.inherit(function (sup) {
				return function (props) {
					sup.apply(this, arguments);
					this.initAccessibility();
				};
			}),

			/**
			* @private
			*/
			initAccessibility: function () {
				if (this.accessibilityLabel) {
					this.accessibilityLabelChanged();
				}

				//TODO: adding accessibility code such as accessibilityDisabled.
			},

			/**
			* @private
			*/
			contentChanged: enyo.inherit(function (sup) {
				return function (control) {
					sup.apply(this, arguments);

					// Accessibility : Set aria-label to current content 
					// when content changed. The accessibilityLabel has higher priority
					// than content, so if accessibilityLabel is set 'aria-label' is handled
					// in accessibilityLabelChanged.
					if (this.content && !this.accessibilityLabel) {
						this.setAttribute('tabindex', 0);
						this.setAttribute('aria-label', this.content);
					}
				};
			}),

			/**
			* Get the accessibilityLabel.
			*
			* @returns {String} return accessibilityLabel.
			* @public
			*/
			getAccessibilityLabel: function () {
				return this.accessibilityLabel;
			},

			/**
			* Set the accessibilityLabel with label text.
			* When the control is focused, screen reader reads accessibilityLabel.
			*
			* @param {Boolean} accessibilityLabel - text to readout by screen reader.
			* @returns {this} callee for chaining.
			* @public
			*/
			setAccessibilityLabel: function (accessibilityLabel) {
				var was = this.accessibilityLabel;
				this.accessibilityLabel = accessibilityLabel;

				if (was != accessibilityLabel) {
					this.notify('accessibilityLabel', was, accessibilityLabel);
				}
				return this;
			},

			/**
			* @private
			*/
			accessibilityLabelChanged: function () {
				if (this.accessibilityLabel) {
					this.setAttribute('tabindex', 0);
					this.setAttribute('aria-label', this.accessibilityLabel);
				} else if (this.content) {
					this.setAttribute('aria-label', this.content);
				} else {
					this.setAttribute('tabindex', null);
					this.setAttribute('aria-label', null);
				}
			}
		});
	}
})(enyo, this);
