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
			* AccessibilityAlert is for alert message or page description.
			* If accessibilityAlert is true, screen reader will automatically reads
			* content or accessibilityLabel regardless focus.
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

				if (this.accessibilityAlert) {
					this.accessibilityAlertChanged();
				}

				//TODO: adding accessibility code such as accessibilityDisabled.
			},

			/**
			* @method
			* @private
			*/
			contentChanged: enyo.inherit(function (sup) {
				return function (control) {
					sup.apply(this, arguments);
					// Accessibility : If accessibilityLabel is not set, change
					// aria-label to current content when content changed.
					// If accessibilityHint is defined, combine it with content for more information.
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
			},

			/**
			* Get the accessibilityAlert value true or false.
			*
			* @returns {Boolean} return accessibilityAlert status.
			* @public
			*/
			getAccessibilityAlert: function () {
				return this.accessibilityAlert;
			},

			/**
			* Set the accessibilityAlert to true or false.
			* If accessibilityAlert is true, screen reader will automatically reads
			* content or accessibilityLabel regardless focus.
			*
			* @param {Boolean} accessibilityAlert - if true, screen reader reads content automatically.
			* @returns {this} callee for chaining.
			* @public
			*/
			setAccessibilityAlert: function (accessibilityAlert) {
				var was = this.accessibilityAlert;
				this.accessibilityAlert = accessibilityAlert;

				if (was != accessibilityAlert) {
					this.notify('accessibilityAlert', was, accessibilityAlert);
				}
				return this;
			},

			/**
			* @private
			*/
			accessibilityAlertChanged: function () {
				if (this.accessibilityAlert) {
					this.setAttribute('role', 'alert');
				} else {
					this.setAttribute('role', null);
				}
			}
		});
	}
})(enyo, this);
