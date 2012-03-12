/**
	Implements an HTML textarea element with cross platform support for change events
*/
enyo.kind({
	name: "enyo.TextArea",
	kind: enyo.Input,
	published: {
		//* Number of text rows displayed
		rows: 2
	},
	//* @protected
	tag: "textarea",
	classes: "enyo-textarea",
	create: function() {
		this.inherited(arguments);
		this.rowsChanged();
	},
	rowsChanged: function() {
		this.setAttribute("rows", this.rows);
	}
});
