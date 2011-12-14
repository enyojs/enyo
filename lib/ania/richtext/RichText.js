/**
A multi-line text input that supports rich formatting such as bold, italics, and underlining.
Note that rich formatting can be disabled by setting the richContent property to false.

Use the value property to get or set the displayed text. The onchange event fires when the control blurs (loses focus).

Create a RichText as follows:

	{kind: "RichText", value: "To <b>boldly</b> go..", onchange: "richTextChange"}

*/
/**
	A styled rich text control.
	
	See <a href="#enyo.RichText">enyo.RichText</a> for more information.
*/
enyo.kind({
	name: "enyo.RichText", 
	kind: enyo.Input,
	published: {
		richContent: true,
		maxTextHeight: null,
		/**
		The selection property is a dom Selection object describing the selected text.
		It cannot be set. Instead the selection can be altered by manipulated the object directly
		via the dom selection object api.
		For example, this.$.richText.getSelection().collapseToEnd();
		*/
		selection: null
	},
	events: {
		onchange: ""
	},
	inputChrome: [
		{name: "input", flex: 1, kind: enyo.BasicRichText, className: "enyo-input-input", onchange: "doChange"},
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.richContentChanged();
		this.maxTextHeightChanged();
	},
	richContentChanged: function() {
		this.$.input.setRichContent(this.richContent);
	},
	maxTextHeightChanged: function() {
		if (this.maxTextHeight) {
			this.$.input.applyStyle("max-height", this.maxTextHeight);
		}
	},
	getHtml: function() {
		return this.$.input.getHtml();
	},
	getText: function() {
		return this.$.input.getText();
	},
	inputChange: function(inSender, inEvent) {
		if (this.changeOnKeypress) {
			return true;
		} else {
			this.value = inSender.getValue();
			this.doChange(inEvent, this.value);
		}
	},
	inputTypeChanged: function() {
		this.$.input.setAttribute("x-palm-input-type", this.inputType);
		if (this.hasNode()) {
			this.$.input.render();
		}
	},
	selectionChanged: function() {
	},
	/**
	returns a dom selection object
	*/
	getSelection: function() {
		return this.$.input.getSelection();
		
	},
	/**
	Removes the current selection and places the cursor at the end of the previous selection.
	inStart {Boolean} if true, then places the cursor at the start of the previous selection.
	*/
	removeSelection: function(inStart) {
		this.$.input.removeSelection(inStart);
	},
	/**
	Modify the selection; functions only when RichText is focused.
	Exposes the dom modify selection api, see https://developer.mozilla.org/en/DOM/Selection/modify
	inType {String} 'extend' to extend the selection or 'move' to move it.
	inDirection {String} 'forward' or 'back'; or alternatively 'left' or 'right'
	inAmount {String} one of 'character', 'word', 'sentence', 'line', 'paragraph',
	'lineboundary', 'sentenceboundary', 'paragraphboundary', or 'documentboundary'
	*/
	modifySelection: function(inType, inDirection, inAmount) {
		this.$.input.modifySelection(inType, inDirection, inAmount);
	},
	/**
	Move the cursor; functions only when RichText is focused.
	inDirection {String} values same as modifySelection
	inAmount {String} values same as modifySelection
	*/
	moveCursor: function(inDirection, inAmount) {
		this.$.input.moveCursor(inDirection, inAmount);
	},
	/**
	Move the cursor to the end of editable content; functions only when RichText is focused.
	*/
	moveCursorToEnd: function() {
		this.$.input.moveCursorToEnd();
	},
	/**
	Move the cursor to the start of editable content; functions only when RichText is focused.
	*/
	moveCursorToStart: function() {
		this.$.input.moveCursorToStart();
	},
	/**
	Select all editable content; functions only when RichText is focused.
	*/
	selectAll: function() {
		this.$.input.selectAll();
	},
	/**
	Insert the given text or html (inValue) in the RichText at the cursor positon; 
	functions only when RichText is focused. Note: replaces any current selection.
	*/
	insertAtCursor: function(inValue) {
		this.$.input.insertAtCursor(inValue);
	}
});
