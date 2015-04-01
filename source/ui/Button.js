(function (enyo, scope) {
	/**
	* {@link enyo.Button} implements an HTML [button]{@glossary button}, with support
	* for grouping using {@link enyo.Group}.
	*
	* For more information, see the documentation on
	* [Buttons]{@linkplain $dev-guide/building-apps/controls/buttons.html} in the
	* Enyo Developer Guide.
	*
	* @class enyo.Button
	* @extends enyo.ToolDecorator
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Button.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Button',
		
		/**
		* @private
		*/
		kind: 'enyo.ToolDecorator',

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
			 * can cause unexpected problems when [controls]{@link enyo.Control} are used
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
			/** @lends enyo.Button.prototype */ {
			
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
		create: enyo.inherit(function (sup) {
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
		}
	});

})(enyo, this);
