/**
A multi-line text input that supports rich formatting such as bold, italics, and underlining.
Note that rich formatting can be disabled by setting the richContent property to false.

Use the value property to get or set the displayed text. The onchange event fires when the 
control blurs (loses focus).

Create a BasicRichText as follows:

	{kind: "BasicRichText", value: "To <b>boldly</b> go..", onchange: "richTextChange"}

*/
enyo.kind({
	name: "enyo.BasicRichText",
	kind: enyo.BasicInput,
	className: "enyo-richtext",
	placeholderClassName: "enyo-richtext-hint",
	published: {
		richContent: true
	},
	disabledClassName: "enyo-richtext-disabled",
	//* @protected
	tagName: "div",
	// NOTE: only required in browser, overridden below
	requiresDomMousedown: true,
	requiresNodeFocus: true,
	create: function() {
		this.inherited(arguments);
		this.attributes.contenteditable = true;
		this.richContentChanged();
	},
	focusHandler: function(inSender, e) {
		// track if the focus event occurred, done so that a value can be changed correctly
		// (and not interact poorly with hint) within a focus event handler.
		this.didFocus = true;
		return this.inherited(arguments);
	},
	blurHandler: function(inSender, inEvent) {
		this.didFocus = false;
		var r = this.inherited(arguments);
		this.doChange(inEvent, this.getValue());
		return r;
	},
	isEmpty: function() {
		// FIXME: argh, checking for getValue resets this.value which we need when 
		// we're initializing so check if we're generated yet.
		return this.generated ? !this.getValue() : !this.value;
	},
	placeholderChanged: function(inOldValue) {
		this.inherited(arguments);
		if ((this.isEmpty() || (this.getValue() == inOldValue)) && !this.hasFocus()) {
			this.updatePlaceholder(true);
		}
	},
	updatePlaceholder: function(inApplyPlaceholder) {
		var c = inApplyPlaceholder ? this.placeholder : "";
		this.setDomValue(c);
		this.inherited(arguments);
	},
	getText: function() {
		var t = (this.hasNode() && this.node.innerText) || "";
		return t == this.placeholder ? "" : t;
	},
	//* @public
	//* Return the HTML content of the RichText
	getHtml: function() {
		var t = (this.hasNode() && this.node.innerHTML) || "";
		// strip trailing <br> because it's not displayed
		t = t.replace(/<br>$/, "");
		return t == this.placeholder ? "" : t;
	},
	//* @protected
	setDomValue: function(inValue) {
		if (!this.richContent) {
			inValue = (inValue || "").replace(/\n/g, "<br>");
		}
		if (this.hasFocus()) {
			this.selectAll();
			this.insertAtCursor(inValue);
		} else {
			this.setContent(inValue);
		}
	},
	getDomValue: function() {
		return enyo.string.trim(this.richContent ? this.getHtml() : this.getText());
	},
	valueChanged: function() {
		this.setDomValue(this.value);
		// update placeholder if value changes to an empty value and we are not focused.
		// note: hasFocus() is not true when a focus event is being processed, but didFocus is
		// we check did focus so that value can be changed in an onfocus handler.
		if (this.isEmpty() && !this.didFocus) {
			this.updatePlaceholder(true);
		}
		
	},
	contentChanged: function() {
		// NOTE: set content via innerHTML to avoid loss of focus.
		// setting innerHTML to minimum of 1 space miraculously avoids loss of focus.
		var c = this.content;
		this.content = this.content || " ";
		this.inherited(arguments);
		if ((c != this.placeholder) && !this.isEmpty()) {
			this.addRemovePlaceholderClassName(false);
		}
	},
	readonlyChanged: function() {
		this.addRemoveClass("enyo-richtext-readonly", this.readonly);
	},
	richContentChanged: function() {
		this.addRemoveClass("enyo-richtext-plaintext", !this.richContent);
		this.allowHtml = this.richContent;
		if (!this.richContent) {
			this.setDomValue(this.hasNode() ? this.getText() : this.value || this.placeholder);
		}
	},
	// rich text doesn't automatically focus when selected, so do so
	applySelect: function(inCallback) {
		if (this.hasNode()) {
			this.node.focus();
			this.selectAll();
			if (inCallback) {
				inCallback();
			}
		}
	},
	getSelection: function() {
		return this.hasFocus() ? window.getSelection() : null;
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
	insertAtCursor: function(inValue) {
		if (this.hasFocus()) {
			var v = this.allowHtml ? inValue : enyo.string.escapeHtml(inValue).replace(/\n/g, "<br/>");
			document.execCommand("insertHTML", false, v);
		}
	}
});

// on devices with focusAtPoint api, do not need special mousedown handling.
enyo.requiresWindow(function() {
	if (window.PalmSystem) {
		enyo.BasicRichText.prototype.requiresDomMousedown = false;
	}
});
