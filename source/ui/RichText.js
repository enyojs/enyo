/**
	A multi-line text input that supports rich formatting such as bold, italics, and underlining.

	Use the value property to get or set the displayed text.

	RichText is not supported on Android < 3.

	Selection operations, and [insertAtCursor](#enyo.RichText::insertAtCursor) use the HTML Editing APIs

	[HTML Editing APIs # Selection Reference](https://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#selections)
*/
enyo.kind({
	name: "enyo.RichText",
	classes: "enyo-richtext enyo-selectable",
	published: {
		disabled: false,
		value: ""
	},
	events: {
		//* cross platform input change event (IE does not support oninput)
		onInputChange: ""
	},
	//* @protected
	attributes: {
		contenteditable: true,
		onfocus: enyo.bubbler,
		onblur: enyo.bubbler
	},
	handlers: {
		oninput: "input"
	},
	create: function() {
		if (enyo.platform.ie) {
			this.handlers.onkeyup = "keyup";
		}
		this.inherited(arguments);
		this.disabledChanged();
		this.valueChanged();
	},
	keyup: function() {
		this.notifyContainer();
	},
	input: function() {
		this.notifyContainer();
	},
	notifyContainer: function() {
		this.bubble("onInputChange");
	},
	disabledChanged: function() {
		this.setAttribute("disabled", this.disabled);
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
	getValue: function() {
		if (this.hasNode()) {
			return this.node.innerHTML;
		}
	},
	focus: function() {
		if (this.hasNode()) {
			this.node.focus();
		}
	},
	//* Returns true if the RichText is focused, using querySelector
	hasFocus: function() {
		if (this.hasNode()) {
			return Boolean(this.node.parentNode.querySelector("#" + this.id + ":focus"));
		}
	},
	clear: function() {
		this.setValue("");
	},
	/**
		Return the selection object
	*/
	getSelection: function() {
		if (this.hasFocus()) {
			return window.getSelection();
		}
	},
	removeSelection: function(inStart) {
		var s = this.getSelection();
		if (s) {
			s[inStart ? "collapseToStart" : "collapseToEnd"]();
		}
	},
	modifySelection: function(inType, inDirection, inAmount) {
		var s = this.getSelection();
		if (s) {
			s.modify(inType || "move", inDirection, inAmount);
		}
	},
	//* Moves the cursor according to the Editing API
	moveCursor: function(inDirection, inAmount) {
		this.modifySelection("move", inDirection, inAmount);
	},
	moveCursorToEnd: function() {
		this.moveCursor("forward", "documentboundary");
	},
	moveCursorToStart: function() {
		this.moveCursor("backward", "documentboundary");
	},
	selectAll: function() {
		if (this.hasFocus()) {
			document.execCommand("selectAll");
		}
	},
	//* Insert HTML at the cursor position, HTML is escaped unless the _allowHTML_ property is true
	insertAtCursor: function(inValue) {
		if (this.hasFocus()) {
			var v = this.allowHtml ? inValue : enyo.Control.escapeHtml(inValue).replace(/\n/g, "<br/>");
			document.execCommand("insertHTML", false, v);
		}
	}
});
