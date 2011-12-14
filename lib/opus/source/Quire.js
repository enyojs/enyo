enyo.kind({
	name: "enyo.Quire",
	kind: enyo.Control,
	published: {
		sheet: ""
	},
	nullSheet: {
		hide: enyo.nop
	},
	constructor: function() {
		this.activeSheet = this.nullSheet;
		this.inherited(arguments);
	},
	addControl: function(inControl) {
		if (this.controls.length) {
			inControl.hide();
		} else {
			this.activeSheet = inControl;
		}
		this.inherited(arguments);
	},
	sheetChanged: function() {
		if (enyo.isString(this.sheet)) {
		} else {
			var neo = this.controls[this.sheet];
			if (neo && neo != this.activeSheet) {
				neo.show();
				this.activeSheet.hide();
				this.activeSheet = neo;
			}
		}
	}
});