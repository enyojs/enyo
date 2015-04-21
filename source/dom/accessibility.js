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

				if (this.accessibilityHint) {
					this.accessibilityHintChanged();
				}
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
					// in accessibilityLabelChanged. And if accessibilityHint is defined, 
					// combine it with content for more information.
					if (this.content && !this.accessibilityLabel) {
						this.setAttribute('tabindex', 0);
						this.setAttribute('aria-label', this.accessibilityHint? this.content + ' ' + this.accessibilityHint : this.content);
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
					this.setAttribute('aria-label', this.accessibilityHint? this.accessibilityLabel + ' ' + this.accessibilityHint : this.accessibilityLabel);
				} else if (this.content) {
					this.setAttribute('aria-label', this.accessibilityHint? this.content + ' ' + this.accessibilityHint : this.content);
				} else {
					this.setAttribute('tabindex', this.accessibilityHint? 0 : null);
					this.setAttribute('aria-label', this.accessibilityHint? this.accessibilityHint : null);
				}
			},

			/**
			* Get the accessibilityHint.
			*
			* @returns {String} return accessibilityHint.
			* @public
			*/
			getAccessibilityHint: function () {
				return this.accessibilityHint;
			},

			/**
			* Set the accessibilityHint with hint text.
			* When the control is focused, screen reader reads accessibilityHint with
			* content or accessibilityLabel.
			*
			* @param {Boolean} accessibilityHint - text to readout by screen reader.
			* @returns {this} callee for chaining.
			* @public
			*/
			setAccessibilityHint: function (accessibilityHint) {
				var was = this.accessibilityHint;
				this.accessibilityHint = accessibilityHint;

				if (was != accessibilityHint) {
					this.notify('accessibilityHint', was, accessibilityHint);
				}
				return this;
			},

			/**
			* @private
			*/
			accessibilityHintChanged: function () {
				if (this.accessibilityLabel) {
					this.setAttribute('aria-label', this.accessibilityHint? this.accessibilityLabel + ' ' + this.accessibilityHint : this.accessibilityLabel);
				} else if (this.content) {
					this.setAttribute('aria-label', this.accessibilityHint? this.content + ' ' + this.accessibilityHint : this.content);
				} else {
					this.setAttribute('tabindex', this.accessibilityHint? 0 : null);
					this.setAttribute('aria-label', this.accessibilityHint? this.accessibilityHint : null);
				}
			}
		});
	}
})(enyo, this);
