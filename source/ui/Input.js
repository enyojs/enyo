(function (enyo, scope) {
	/**
	* Fires immediately when the text changes.
	*
	* @event enyo.Input#oninput
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the text has changed and the [input]{@link enyo.Input} subsequently loses
	* focus.
	*
	* @event enyo.Input#onchange
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the [input]{@link enyo.Input} is disabled or enabled.
	*
	* @event enyo.Input#onDisabledChange
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* {@link enyo.Input} implements an HTML [&lt;input&gt;]{@glossary input} element
	* with cross-platform support for change [events]{@glossary event}.
	*
	* You may listen for [oninput]{@link enyo.Input#oninput} and
	* [onchange]{@link enyo.Input#onchange} [DOM events]{@glossary DOMEvent} from
	* this [control]{@link enyo.Control} to know when the text inside has been modified.
	*
	* For more information, see the documentation on
	* [Text Fields]{@linkplain $dev-guide/building-apps/controls/text-fields.html}
	* in the Enyo Developer Guide.
	*
	* @class enyo.Input
	* @extends enyo.Control
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Input.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Input',

		/**
		* @private
		*/
		kind: 'enyo.Control',

		/**
		* @private
		*/
		published:
			/** @lends enyo.Input.prototype */ {

			/**
			* Value of the [input]{@link enyo.Input}. Use this property only to initialize the
			* value. Call `getValue()` and `setValue()` to manipulate the value at runtime.
			*
			* @type {String}
			* @default ''
			* @public
			*/
			value: '',

			/**
			* Text to display when the [input]{@link enyo.Input} is empty
			*
			* @type {String}
			* @default ''
			* @public
			*/
			placeholder: '',

			/**
			* Type of [input]{@link enyo.Input}; if not specified, it's treated as `'text'`.
			* This may be anything specified for the `type` attribute in the HTML
			* specification, including `'url'`, `'email'`, `'search'`, or `'number'`.
			*
			* @type {String}
			* @default ''
			* @public
			*/
			type: '',

			/**
			* When `true`, prevents input into the [control]{@link enyo.Control}. This maps
			* to the `disabled` DOM attribute.
			*
			* @type {Boolean}
			* @default false
			* @public
			*/
			disabled: false,

			/**
			* When `true`, the contents of the [input]{@link enyo.Input} will be selected
			* when the input gains focus.
			*
			* @type {Boolean}
			* @default false
			* @public
			*/
			selectOnFocus: false
		},

		/**
		* @private
		*/
		events: {
			onDisabledChange: ''
		},

		/**
		* Set to `true` to focus this [control]{@link enyo.Control} when it is rendered.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		defaultFocus: false,

		/**
		* @private
		*/
		tag: 'input',

		/**
		* @private
		*/
		classes: 'enyo-input',

		/**
		* @private
		*/
		handlers: {
			onfocus: 'focused',
			oninput: 'input',
			onclear: 'clear',
			ondragstart: 'dragstart'
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				if (enyo.platform.ie) {
					this.handlers.onkeyup = 'iekeyup';
				}
				if (enyo.platform.windowsPhone) {
					this.handlers.onkeydown = 'iekeydown';
				}
				sup.apply(this, arguments);
				this.placeholderChanged();
				// prevent overriding a custom attribute with null
				if (this.type) {
					this.typeChanged();
				}
			};
		}),

		/**
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);

				enyo.makeBubble(this, 'focus', 'blur');

				//Force onchange event to be bubbled inside Enyo for IE8
				if(enyo.platform.ie == 8){
					this.setAttribute('onchange', enyo.bubbler);
				}

				this.disabledChanged();
				if (this.defaultFocus) {
					this.focus();
				}
			};
		}),

		/**
		* @private
		*/
		typeChanged: function () {
			this.setAttribute('type', this.type);
		},

		/**
		* @private
		*/
		placeholderChanged: function () {
			this.setAttribute('placeholder', this.placeholder);
			this.valueChanged();
		},

		/**
		* @fires enyo.Input#onDisabledChange
		* @private
		*/
		disabledChanged: function () {
			this.setAttribute('disabled', this.disabled);
			this.bubble('onDisabledChange');
		},

		/**
		* @private
		*/
		valueChanged: function () {
			var node = this.hasNode(),
				attrs = this.attributes;
			if (node) {
				if (node.value !== this.value) {
					node.value = this.value;
				}
				// we manually update the cached value so that the next time the
				// attribute is requested or the control is re-rendered it will
				// have the correct value - this is because calling setAttribute()
				// in some cases does not receive an appropriate response from the
				// browser
				attrs.value = this.value;
			} else {
				this.setAttribute('value', this.value);
			}
			this.detectTextDirectionality((this.value || this.value === 0) ? this.value : this.get('placeholder'));
		},

		/**
		* @private
		*/
		iekeyup: function (sender, e) {
			var ie = enyo.platform.ie, kc = e.keyCode;
			// input event missing on ie 8, fails to fire on backspace and delete keys in ie 9
			if (ie <= 8 || (ie == 9 && (kc == 8 || kc == 46))) {
				this.bubble('oninput', e);
			}
		},

		/**
		* @private
		*/
		iekeydown: function (sender, e) {
			var wp = enyo.platform.windowsPhone, kc = e.keyCode, dt = e.dispatchTarget;
			// onchange event fails to fire on enter key for Windows Phone 8, so we force blur
			if (wp <= 8 && kc == 13 && this.tag == 'input' && dt.hasNode()) {
				dt.node.blur();
			}
		},

		/**
		* @private
		*/
		clear: function () {
			this.setValue('');
		},

		// note: we disallow dragging of an input to allow text selection on all platforms
		/**
		* @private
		*/
		dragstart: function () {
			return this.hasFocus();
		},

		/**
		* @private
		*/
		focused: function () {
			if (this.selectOnFocus) {
				enyo.asyncMethod(this, 'selectContents');
			}
		},

		/**
		* @private
		*/
		selectContents: function () {
			var n = this.hasNode();

			if (n && n.setSelectionRange) {
				n.setSelectionRange(0, n.value.length);
			} else if (n && n.createTextRange) {
				var r = n.createTextRange();
				r.expand('textedit');
				r.select();
			}
		},

		/**
		* @private
		*/
		input: function () {
			var val = this.getNodeProperty('value');
			this.setValue(val);
		}
	});

})(enyo, this);
