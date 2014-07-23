(function (enyo, scope) {
	/**
	* The type of change to apply. Possible values are 'move' and 'extend'.
	*
	* @typedef {String} enyo.RichText~ModifyType
	*/

	/**
	* The direction in which to apply the change. Possible values include: 'forward', 'backward', 
	* 'left', and 'right'.
	*
	* @typedef {String} enyo.RichText~ModifyDirection
	*/

	/**
	* This is the granularity for the change. Possible values include: 'character', 'word', 
	* 'sentence', 'line', 'paragraph', 'lineboundary', 'sentenceboundary', 'paragraphboundary', and 
	'documentboundary'.
	*
	* @typedef {String} enyo.RichText~ModifyAmount
	*/

	/**
	* _enyo.RichText_ is a multi-line text [input]{@link external:input that supports rich 
	* formatting, such as bold, italics, and underlining.
	* 
	* The content displayed in a [RichText]{@link enyo.RichText} may be accessed at runtime via the
	* `getValue()` and `setValue()` methods.
	* 
	* For more information, see the documentation on [Text
	* Fields](building-apps/controls/text-fields.html) in the Enyo Developer Guide.
	*
	* @ui
	* @class enyo.RichText
	* @extends enyo.Input
	* @public
	*/
	enyo.kind(
		/** @lends enyo.RichText.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.RichText',

		/**
		* @private
		*/
		kind: 'enyo.Input',

		/**
		* @private
		*/
		classes: 'enyo-richtext enyo-selectable',

		/**
		* @private
		*/
		published: 
			/** @lends enyo.RichText.prototype */ {
			
			/**
			* _allowHtml_ is enabled by default in [RichText]{@link enyo.RichText} to take advantage
			* of all the rich editing properties. However, this allows for **ANY** HTML to be 
			* inserted into the [RichText]{@link enyo.RichText}, including 
			* [iframe]{@link external:iframe} and [script]{@link external:script} tags, which can be
			* a secuity concern in some situations. If set to `false`, inserted HTML will be escaped.
			* 
			* @type {Boolean}
			* @default true
			* @public
			*/
			allowHtml: true,

			/**
			* If `true`, the [RichText]{@link enyo.RichText} will not accept input or generate 
			* [events]{@link external:event}.
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
		protectedStatics: {
			osInfo: [
				{os: 'android', version: 3},
				{os: 'ios', version: 5}
			],
			//* Returns true if the platform has contenteditable attribute.
			hasContentEditable: function() {
				for (var i=0, t; (t=enyo.RichText.osInfo[i]); i++) {
					if (enyo.platform[t.os] < t.version) {
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
		* Create [RichText]{@link enyo.RichText} as a div if platform has `contenteditable` 
		* attribute, otherwise create it as a `textarea`.
		*
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				this.setTag(enyo.RichText.hasContentEditable()?'div':'textarea');
				sup.apply(this, arguments);
				this.disabledChanged();
			};
		}),

		/**
		* @private
		*/
		focusHandler: function() {
			this._value = this.get('value');
		},
		/**
		* Simulate [onchange]{@link enyo.Input#event:onchange} [event]{@link external:event} that 
		* [inputs]{@link enyo.Input} expose.
		*
		* @fires enyo.Input#event:onchange
		* @private
		*/
		blurHandler: function() {
			if (this._value !== this.get('value')) {
				this.bubble('onchange');
			}
		},
		/**
		* @private
		*/
		valueChanged: function() {
			var val = this.get('value');
			if (this.hasFocus() && val !== this.node.innerHTML) {
				this.selectAll();
				this.insertAtCursor(val);
			} else if(!this.hasFocus()) {
				this.set('content', val);
			}
		},
		/**
		* @private
		*/
		disabledChanged: function() {
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
		updateValue: function() {
			var val = this.node.innerHTML;
			this.set('value', val);
		},
		/**
		* @private
		*/
		updateValueAsync: function() {
			enyo.asyncMethod(this.bindSafely('updateValue'));
		},

		/**
		* Determine if this [control]{@link enyo.Control} has focus.
		*
		* @returns {Boolean} Returns `true` if the [RichText]{@link enyo.RichText} is focused.
		* @public
		*/
		hasFocus: function() {
			if (this.hasNode()) {
				return document.activeElement === this.node;
			}
		},
		/**
		* Retrieve the current selection in the [RichText]{@link enyo.RichText}.
		* 
		* @returns {Selection} The [selection]{@external:selection} [object]{@external:Object}.
		* @public
		*/
		getSelection: function() {
			if (this.hasFocus()) {
				return window.getSelection();
			}
		},

		/**
		* Removes the [selection]{@link external:Selection} [object]{@link external:Object}.
		* 
		* @param {Boolean} start If `true`, the [selection]{@link external:Selection} is 
		*	[collapsed to the start]{@link external:Selection.collapseToStart} of the 
		*	[range]{@link external:Range}, otherwise it is 
		*	[collapsed to the end]{@link external:Selection.collapseToEnd} of the 
		*	[range]{@link external:Range}.
		* @public
		*/
		removeSelection: function(start) {
			var s = this.getSelection();
			if (s) {
				s[start ? 'collapseToStart' : 'collapseToEnd']();
			}
		},

		/**
		* Modifies the [selection]{@link external:Selection} [object]{@link external:Object}. Please
		* see the [Selection.modify]{@link external:Selection.modify} API for more information.
		* 
		* @param {enyo.RichText~ModifyType} type The type of change to apply.
		* @param {enyo.RichText~ModifyDirection} dir The direction in which to apply the change.
		* @param {enyo.RichText~ModifyAmount} amount This is the granularity for the change.
		* @public
		*/
		modifySelection: function(type, dir, amount) {
			var s = this.getSelection();
			if (s) {
				s.modify(type || 'move', dir, amount);
			}
		},

		/**
		* Moves the cursor according to the [Editing API]{@link external:Selection.modify}.
		* 
		* @param {enyo.RichText~ModifyDirection} dir The direction in which to apply the change.
		* @param {enyo.RichText~ModifyAmount} amount This is the granularity for the change.
		* @public
		*/
		moveCursor: function(dir, amount) {
			this.modifySelection('move', dir, amount);
		},

		/**
		* Moves the cursor to end of text field.
		*
		* @public
		*/
		moveCursorToEnd: function() {
			this.moveCursor('forward', 'documentboundary');
		},

		/**
		* Moves the cursor to start of text field.
		*
		* @public
		*/
		moveCursorToStart: function() {
			this.moveCursor('backward', 'documentboundary');
		},

		/**
		* Selects all content in text field.
		*
		* @public
		*/
		selectAll: function() {
			if (this.hasFocus()) {
				document.execCommand('selectAll');
			}
		},

		/**
		* Inserts HTML at the cursor position. HTML is escaped unless the 
		* [allowHTML]{@link enyo.RichText#allowHTML} property is `true`.
		* 
		* @param {String} val The HTML to insert at the current cursor position.
		* @public
		*/
		insertAtCursor: function(val) {
			if (this.hasFocus()) {
				var v = this.allowHtml ? val : enyo.Control.escapeHtml(val).replace(/\n/g, '<br/>');
				document.execCommand('insertHTML', false, v);
			}
		}
	});

})(enyo, this);
