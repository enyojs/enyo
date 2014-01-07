/*
	Implementation notes:
	-	The RichText methods involving selection (HTML5 selection object) require 
		that the RichText object have focus first.
*/
enyo.kind({
	name: "enyo.sample.RichTextSample",
	classes: "rich-text-sample",
	components: [
		{content: "Rich Text", classes: "section"},
		{kind: "enyo.Button", ontap: "buttonFormatTapped", action: "bold", components: [
			{tag: "strong", content: "b"}
		]},
		{kind: "enyo.Button", ontap: "buttonFormatTapped", action: "italic", components: [
			{tag: "em", content: "i"}
		]},
		{kind: "enyo.Button", ontap: "buttonFormatTapped", action: "underline", components: [
			{tag: "u", content: "u"}
		]},
		{kind: "enyo.Button", content: "Select All", ontap: "buttonSelectAllTapped"},
		{kind: "enyo.Button", content: "Deselect All", ontap: "buttonDeselectAllTapped"},
		{kind: "enyo.Button", content: "Home", ontap: "buttonHomeTapped"},
		{kind: "enyo.Button", content: "End", ontap: "buttonEndTapped"},
		{kind: "enyo.RichText", value: "Input <em>any</em> text (HTML tags will be preserved)"},
		{kind: "enyo.Button", content: "Show RichText Value", classes: "button-value", ontap: "buttonValueTapped"},
		{name: "results", classes: "results"}
	],
	buttonSelectAllTapped: function(inSender, inEvent) {
		this.$.richText.focus();
		this.$.richText.selectAll();
	},
	buttonDeselectAllTapped: function(inSender, inEvent) {
		this.$.richText.focus();
		this.$.richText.removeSelection();
	},
	buttonHomeTapped: function(inSender, inEvent) {
		this.$.richText.focus();
		this.$.richText.moveCursorToStart();
	},
	buttonEndTapped: function(inSender, inEvent) {
		this.$.richText.focus();
		this.$.richText.moveCursorToEnd();
	},
	buttonFormatTapped: function(inSender, inEvent) {
		this.$.richText.focus();
		document.execCommand(inSender.action, false, this.$.richText.getSelection());
		this.$.richText.updateValue();
	},
	buttonValueTapped: function(inSender, inEvent) {
		this.$.results.setContent(this.$.richText.getValue());
	}
});