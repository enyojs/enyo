//* @public

/**
	enyo.Style is a wrapper for a style tag, which automatically wrapps the
	content property in proper CSS commented format.
*/
enyo.kind({
	name: "enyo.Style",
	//* @protected
	tag: "style",
	classes: "moon-style",
	attributes: {
		type: "text/css"
	},
	allowHtml: true,
	contentChanged: function() {
		this.content = "<!--\n" + this.content + "\n-->";
		this.inherited(arguments);
	}
});
