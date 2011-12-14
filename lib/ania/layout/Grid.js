enyo.kind({
	name: "enyo.Grid",
	kind: enyo.Control,
	cellClass: "",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.addClass("enyo-grid");
	},
	addControl: function(inControl) {
		this.inherited(arguments);
		inControl.addClass('enyo-grid-div ' + this.cellClass);
	}
});
