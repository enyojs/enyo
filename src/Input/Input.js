require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Input~Input} kind.
* @module enyo/Input
*/

var
	kind = require('../kind'),
	utils = require('../utils'),
	dispatcher = require('../dispatcher'),
	platform = require('../platform');
var
	Control = require('../Control');

/**
* Fires immediately when the text changes.
*
* @event module:enyo/Input~Input#oninput
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the text has changed and the [input]{@link module:enyo/Input~Input} subsequently loses
* focus.
*
* @event module:enyo/Input~Input#onchange
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the [input]{@link module:enyo/Input~Input} is disabled or enabled.
*
* @event module:enyo/Input~Input#onDisabledChange
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* {@link module:enyo/Input~Input} implements an HTML [&lt;input&gt;]{@glossary input} element
* with cross-platform support for change [events]{@glossary event}.
*
* You may listen for [oninput]{@link module:enyo/Input~Input#oninput} and
* [onchange]{@link module:enyo/Input~Input#onchange} [DOM events]{@glossary DOMEvent} from
* this [control]{@link module:enyo/Control~Control} to know when the text inside has been modified.
*
* For more information, see the documentation on
* [Text Fields]{@linkplain $dev-guide/building-apps/controls/text-fields.html}
* in the Enyo Developer Guide.
*
* @class Input
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Input~Input.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Input',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	published:
		/** @lends module:enyo/Input~Input.prototype */ {

		/**
		* Value of the [input]{@link module:enyo/Input~Input}. Use this property only to initialize the
		* value. Call `getValue()` and `setValue()` to manipulate the value at runtime.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		value: '',

		/**
		* Text to display when the [input]{@link module:enyo/Input~Input} is empty
		*
		* @type {String}
		* @default ''
		* @public
		*/
		placeholder: '',

		/**
		* Type of [input]{@link module:enyo/Input~Input}; if not specified, it's treated as `'text'`.
		* This may be anything specified for the `type` attribute in the HTML
		* specification, including `'url'`, `'email'`, `'search'`, or `'number'`.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		type: '',

		/**
		* When `true`, prevents input into the [control]{@link module:enyo/Control~Control}. This maps
		* to the `disabled` DOM attribute.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		disabled: false,

		/**
		* When `true`, the contents of the [input]{@link module:enyo/Input~Input} will be selected
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
	* Set to `true` to focus this [control]{@link module:enyo/Control~Control} when it is rendered.
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
	create: kind.inherit(function (sup) {
		return function() {
			if (platform.ie) {
				this.handlers.onkeyup = 'iekeyup';
			}
			if (platform.windowsPhone) {
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
	rendered: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);

			dispatcher.makeBubble(this, 'focus', 'blur');

			//Force onchange event to be bubbled inside Enyo for IE8
			if(platform.ie == 8){
				this.setAttribute('onchange', dispatcher.bubbler);
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
	* @fires module:enyo/Input~Input#onDisabledChange
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
		var ie = platform.ie, kc = e.keyCode;
		// input event missing on ie 8, fails to fire on backspace and delete keys in ie 9
		if (ie <= 8 || (ie == 9 && (kc == 8 || kc == 46))) {
			this.bubble('oninput', e);
		}
	},

	/**
	* @private
	*/
	iekeydown: function (sender, e) {
		var wp = platform.windowsPhone, kc = e.keyCode, dt = e.dispatchTarget;
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
			utils.asyncMethod(this, 'selectContents');
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
	},

	// Accessibility

	/**
	* @default textbox
	* @type {String}
	* @see enyo/AccessibilitySupport~AccessibilitySupport#accessibilityRole
	* @public
	*/
	accessibilityRole: 'textbox',

	/**
	* @private
	*/
	ariaObservers: [
		{path: 'disabled', to: 'aria-disabled'}
	]
});
