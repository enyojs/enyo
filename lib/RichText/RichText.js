require('enyo');

/**
* Contains the declaration for the {@link module:enyo/RichText~RichText} kind.
* @module enyo/RichText
*/



var
	kind = require('../kind'),
	utils = require('../utils'),
	platform = require('../platform');

var
	Control = require('../Control'),
	Input = require('../Input');

/**
* The type of change to apply. Possible values are `'move'` and `'extend'`.
*
* @typedef {String} enyo.RichText~ModifyType
*/

/**
* The direction in which to apply the change. Possible values include: `'forward'`,
* `'backward'`, `'left'`, and `'right'`.
*
* @typedef {String} enyo.RichText~ModifyDirection
*/

/**
* The granularity of the change. Possible values include: `'character'`, `'word'`,
* `'sentence'`, `'line'`, `'paragraph'`, `'lineboundary'`, `'sentenceboundary'`,
* `'paragraphboundary'`, and `'documentboundary'`.
*
* @typedef {String} enyo.RichText~ModifyAmount
*/

/**
* {@link module:enyo/RichText~RichText} is a multi-line text [input]{@link module:enyo/Input~Input} that supports rich
* formatting, such as bold, italics, and underlining.
*
* The content displayed in a RichText may be accessed at runtime via `get('value')`
* and `set('value')`.
*
* For more information, see the documentation on
* [Text Fields]{@linkplain $dev-guide/building-apps/controls/text-fields.html}
* in the Enyo Developer Guide.
*
* @class RichText
* @extends module:enyo/Input~Input
* @ui
* @public
*/
var RichText = module.exports = kind(
	/** @lends module:enyo/RichText~RichText.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.RichText',

	/**
	* @private
	*/
	kind: Input,

	/**
	* @private
	*/
	classes: 'enyo-richtext enyo-selectable',

	/**
	* @private
	*/
	published:
		/** @lends module:enyo/RichText~RichText.prototype */ {

		/**
		* This flag is enabled by default in {@link module:enyo/RichText~RichText} to take advantage
		* of all the rich editing properties. However, this allows for **any** HTML to be
		* inserted into the RichText, including [&lt;iframe&gt;]{@glossary iframe} and
		* [&lt;script&gt;]{@glossary script} tags, which can be a security concern in
		* some situations. If set to `false`, any inserted HTML will be escaped.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		allowHtml: true,

		/**
		* If `true`, the [RichText]{@link module:enyo/RichText~RichText} will not accept input or generate
		* [events]{@glossary event}.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		disabled: false,

		/**
		* Value of the text field.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		value: ''
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
	protectedStatics: {
		osInfo: [
			{os: 'android', version: 3},
			{os: 'ios', version: 5}
		],
		//* Returns true if the platform has contenteditable attribute.
		hasContentEditable: function() {
			for (var i=0, t; (t=RichText.osInfo[i]); i++) {
				if (platform[t.os] < t.version) {
					return false;
				}
			}
			return true;
		}
	},

	/**
	* @private
	*/
	attributes: {
		contenteditable: true
	},

	/**
	* @private
	*/
	handlers: {
		onfocus: 'focusHandler',
		onblur: 'blurHandler',
		onkeyup: 'updateValue',
		oncut: 'updateValueAsync',
		onpaste: 'updateValueAsync',
		// prevent oninput handler from being called lower in the inheritance chain
		oninput: null
	},

	/**
	* Creates [RichText]{@link module:enyo/RichText~RichText} as a `<div>` if the platform has the
	* `contenteditable` attribute; otherwise, creates it as a `<textarea>`.
	*
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			this.setTag(RichText.hasContentEditable()?'div':'textarea');
			sup.apply(this, arguments);
			this.disabledChanged();
		};
	}),

	/**
	* @private
	*/
	focusHandler: function () {
		this._value = this.get('value');
	},
	/**
	* Simulates [onchange]{@link module:enyo/Input~Input#onchange} {@glossary event}
	* exposed by [inputs]{@link module:enyo/Input~Input}.
	*
	* @fires module:enyo/Input~Input#onchange
	* @private
	*/
	blurHandler: function () {
		if (this._value !== this.get('value')) {
			this.bubble('onchange');
		}
	},
	/**
	* @private
	*/
	valueChanged: function () {
		var val = this.get('value');
		if (this.hasFocus() && val !== this.node.innerHTML) {
			this.selectAll();
			this.insertAtCursor(val);
		} else if(!this.hasFocus()) {
			this.set('content', val);
		}
		this.detectTextDirectionality((this.value || this.value === 0) ? this.value : '');
	},
	/**
	* @private
	*/
	disabledChanged: function () {
		if(this.tag === 'div') {
			this.setAttribute('contenteditable', this.disabled ? null : 'true');
		} else {
			this.setAttribute('disabled', this.disabled);
		}
		this.bubble('onDisabledChange');
	},
	/**
	* @private
	*/
	updateValue: function () {
		var val = this.node.innerHTML;
		this.set('value', val);
	},
	/**
	* @private
	*/
	updateValueAsync: function () {
		utils.asyncMethod(this.bindSafely('updateValue'));
	},

	/**
	* Determines whether this [control]{@link module:enyo/Control~Control} has focus.
	*
	* @returns {Boolean} `true` if the [RichText]{@link module:enyo/RichText~RichText} is focused;
	* otherwise, `false`.
	* @public
	*/
	hasFocus: function () {
		if (this.hasNode()) {
			return document.activeElement === this.node;
		}
	},
	/**
	* Retrieves the current [selection]{@glossary Selection} from the
	* [RichText]{@link module:enyo/RichText~RichText}.
	*
	* @returns {Selection} The [selection]{@glossary Selection} [object]{@glossary Object}.
	* @public
	*/
	getSelection: function () {
		if (this.hasFocus()) {
			return global.getSelection();
		}
	},

	/**
	* Removes the [selection]{@glossary Selection} [object]{@glossary Object}.
	*
	* @param {Boolean} start - If `true`, the [selection]{@glossary Selection} is
	*	[collapsed to the start]{@glossary Selection.collapseToStart} of the
	*	[range]{@glossary Range}; otherwise, it is
	*	[collapsed to the end]{@glossary Selection.collapseToEnd} of the range.
	* @public
	*/
	removeSelection: function (start) {
		var s = this.getSelection();
		if (s) {
			s[start ? 'collapseToStart' : 'collapseToEnd']();
		}
	},

	/**
	* Modifies the [selection]{@glossary Selection} [object]{@glossary Object}. Please
	* see the [Selection.modify]{@glossary Selection.modify} API for more information.
	*
	* @param {module:enyo/RichText~ModifyType} type - The type of change to apply.
	* @param {module:enyo/RichText~ModifyDirection} dir - The direction in which to apply the change.
	* @param {module:enyo/RichText~ModifyAmount} amount - The granularity of the change.
	* @public
	*/
	modifySelection: function (type, dir, amount) {
		var s = this.getSelection();
		if (s) {
			s.modify(type || 'move', dir, amount);
		}
	},

	/**
	* Moves the cursor according to the [Editing API]{@glossary Selection.modify}.
	*
	* @param {module:enyo/RichText~ModifyDirection} dir - The direction in which to apply the change.
	* @param {module:enyo/RichText~ModifyAmount} amount - The granularity of the change.
	* @public
	*/
	moveCursor: function (dir, amount) {
		this.modifySelection('move', dir, amount);
	},

	/**
	* Moves the cursor to end of text field.
	*
	* @public
	*/
	moveCursorToEnd: function () {
		this.moveCursor('forward', 'documentboundary');
	},

	/**
	* Moves the cursor to start of text field.
	*
	* @public
	*/
	moveCursorToStart: function () {
		this.moveCursor('backward', 'documentboundary');
	},

	/**
	* Selects all content in text field.
	*
	* @public
	*/
	selectAll: function () {
		if (this.hasFocus()) {
			document.execCommand('selectAll');
		}
	},

	/**
	* Inserts HTML at the cursor position. HTML will be escaped unless the
	* [allowHtml]{@link module:enyo/RichText~RichText#allowHtml} property is `true`.
	*
	* @param {String} val - The HTML to insert at the current cursor position.
	* @public
	*/
	insertAtCursor: function (val) {
		if (this.hasFocus()) {
			var v = this.allowHtml ? val : Control.escapeHtml(val).replace(/\n/g, '<br/>');
			document.execCommand('insertHTML', false, v);
		}
	},

	// Accessibility

	/**
	* @private
	*/
	ariaObservers: [
		{to: 'aria-multiline', value: true}
	]
});
