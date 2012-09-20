/**
	_enyo.RichText_ is a multi-line text input that supports rich formatting,
	such as bold, italics, and underlining.

	The content displayed in a RichText may be accessed at runtime via the
	`getValue` and `setValue` methods.

	For more information, see the documentation on
	[Text Fields](https://github.com/enyojs/enyo/wiki/Text-Fields) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.RichText",
	classes: "enyo-richtext enyo-selectable",
	published: {
		/**
			_allowHtml_ is enabled by default in RichText to take advantage of
			all the rich editing properties. However, this allows for **ANY**
			HTML to be inserted into the RichText, including _iframe_ and
			_script_ tags, which can be a secuity concern in some situations.
			If set to false, inserted HTML will be escaped.
		*/
		allowHtml: true,
		//* If true, the RichText will not accept input or generate events
		disabled: false,
		//* Value of the text field
		value: ""
	},
	//* Set to true to focus this control when it is rendered.
	defaultFocus: false,
	//* @protected
	statics: {
		osInfo: [
			{os: "android", version: 3},
			{os: "ios", version: 5}
		],
		//* Returns true if the platform has contenteditable attribute.
		hasContentEditable: function() {
			for (var i=0, t, m; t=enyo.RichText.osInfo[i]; i++) {
				if (enyo.platform[t.os] < t.version) {
					return false;
				}
			}
			return true;
		}
	},
	kind: enyo.Input,
	attributes: {
		contenteditable: true
	},
	handlers: {
		onfocus: "focusHandler",
		onblur: "blurHandler"
	},
	// create RichText as a div if platform has contenteditable attribute, otherwise create it as a textarea
	create: function() {
		this.setTag(enyo.RichText.hasContentEditable()?"div":"textarea");
		this.inherited(arguments);
	},
	// simulate onchange event that inputs expose
	focusHandler: function() {
		this._value = this.getValue();
	},
	blurHandler: function() {
		if (this._value !== this.getValue()) {
			this.bubble("onchange");
		}
	},
	valueChanged: function() {
		if (this.hasFocus()) {
			this.selectAll();
			this.insertAtCursor(this.value);
		} else {
			this.setPropertyValue("content", this.value, "contentChanged");
		}
	},
	//* @public
	//* Gets value of the RichText.
	getValue: function() {
		if (this.hasNode()) {
			return this.node.innerHTML;
		}
	},
	//* Returns true if the RichText is focused.
	hasFocus: function() {
		if (this.hasNode()) {
			return document.activeElement === this.node;
		}
	},
	/**
		Returns the selection object.
	*/
	getSelection: function() {
		if (this.hasFocus()) {
			return window.getSelection();
		}
	},
	//* Removes the selection object.
	removeSelection: function(inStart) {
		var s = this.getSelection();
		if (s) {
			s[inStart ? "collapseToStart" : "collapseToEnd"]();
		}
	},
	//* Modifies the selection object.
	modifySelection: function(inType, inDirection, inAmount) {
		var s = this.getSelection();
		if (s) {
			s.modify(inType || "move", inDirection, inAmount);
		}
	},
	//* Moves the cursor according to the Editing API.
	moveCursor: function(inDirection, inAmount) {
		this.modifySelection("move", inDirection, inAmount);
	},
	//* Moves the cursor to end of text field.
	moveCursorToEnd: function() {
		this.moveCursor("forward", "documentboundary");
	},
	//* Moves the cursor to start of text field.
	moveCursorToStart: function() {
		this.moveCursor("backward", "documentboundary");
	},
	//* Selects all content in text field.
	selectAll: function() {
		if (this.hasFocus()) {
			document.execCommand("selectAll");
		}
	},
	//* Inserts HTML at the cursor position.  HTML is escaped unless the
	//* _allowHTML_ property is true.
	insertAtCursor: function(inValue) {
		if (this.hasFocus()) {
			var v = this.allowHtml ? inValue : enyo.Control.escapeHtml(inValue).replace(/\n/g, "<br/>");
			document.execCommand("insertHTML", false, v);
		}
	}
});
