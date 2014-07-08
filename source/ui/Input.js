(function (enyo, scope) {
	/**
	* Fires immediately when the text changes.
	*
	* @event enyo.Input#event:oninput
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when the text has changed and the [input]{@link enyo.Image} subsequently loses 
	* focus.
	*
	* @event enyo.Input#event:onchange
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when the [input]{@link enyo.Input} is disabled or enabled.
	*
	* @event enyo.Input#event:onDisabledChange
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/
	
	/**
	* _enyo.Input_ implements an HTML [&lt;input&gt;]{@link external:input} element with 
	* cross-platform support for change [events]{@link external:event}.
	* 
	* You can listen for [oninput]{@link enyo.Input#event:oninput} and 
	* [onchange]{@link enyo.Input#event:onchange} [DOM events]{@link external:DOMEvent} from this 
	* [control]{@link enyo.Control} to know when the text inside has been modified.
	* 
	* For more information, see the documentation on [Text
	* Fields](building-apps/controls/text-fields.html) in the Enyo Developer Guide.
	*
	* @class enyo.Input
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
		published: {
			
			/**
			* Value of the [input]{@link enyo.Input}. Use this property only to initialize the 
			* _value_. Call `getValue` and `setValue` to manipulate the _value_ at runtime.
			* 
			* @type {String}
			* @default ''
			* @memberof enyo.Input.prototype
			* @public
			*/
			value: '',

			/**
			* Text to display when the [input]{@link enyo.Input} is empty
			* 
			* @type {String}
			* @default ''
			* @memberof enyo.Input.prototype
			* @public
			*/
			placeholder: '',

			/**
			* Type of [input]{@link enyo.Input}; if not specified, it's treated as "text". It can
			* be anything specified for the _type_ attribute in the 
			* [HTML specification]{@link external:input}, including "url", "email", "search", or 
			* "number".
			* 
			* @type {String}
			* @default ''
			* @memberof enyo.Input.prototype
			* @public
			*/
			type: '',

			/**
			* When `true`, prevents input into the [control]{@link enyo.Control}. This maps to the
			* _disabled_ DOM attribute.
			* 
			* @type {Boolean}
			* @default false
			* @memberof enyo.Input.prototype
			* @public
			*/
			disabled: false,

			/**
			* When `true`, select the contents of the [input]{@link enyo.Input} when it gains focus.
			* 
			* @type {Boolean}
			* @default false
			* @memberof enyo.Input.prototype
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
				this.valueChanged();
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
		typeChanged: function() {
			this.setAttribute('type', this.type);
		},

		/**
		* @private
		*/
		placeholderChanged: function() {
			this.setAttribute('placeholder', this.placeholder);
		},

		/**
		* @fires enyo.Input#event:onDisabledChange
		* @private
		*/
		disabledChanged: function() {
			this.setAttribute('disabled', this.disabled);
			this.bubble('onDisabledChange');
		},

		/**
		* @private
		*/
		valueChanged: function() {
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
		},

		/**
		* @private
		*/
		iekeyup: function(inSender, inEvent) {
			var ie = enyo.platform.ie, kc = inEvent.keyCode;
			// input event missing on ie 8, fails to fire on backspace and delete keys in ie 9
			if (ie <= 8 || (ie == 9 && (kc == 8 || kc == 46))) {
				this.bubble('oninput', inEvent);
			}
		},

		/**
		* @private
		*/
		iekeydown: function(inSender, inEvent) {
			var wp = enyo.platform.windowsPhone, kc = inEvent.keyCode, dt = inEvent.dispatchTarget;
			// onchange event fails to fire on enter key for Windows Phone 8, so we force blur
			if (wp <= 8 && kc == 13 && this.tag == 'input' && dt.hasNode()) {
				dt.node.blur();
			}
		},

		/**
		* @private
		*/
		clear: function() {
			this.setValue('');
		},

		// note: we disallow dragging of an input to allow text selection on all platforms
		/**
		* @private
		*/
		dragstart: function() {
			return this.hasFocus();
		},

		/**
		* @private
		*/
		focused: function() {
			if (this.selectOnFocus) {
				enyo.asyncMethod(this, 'selectContents');
			}
		},

		/**
		* @private
		*/
		selectContents: function() {
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
		input: function() {
			var val = this.getNodeProperty('value');
			this.setValue(val);
		}
	});

})(enyo, this);
