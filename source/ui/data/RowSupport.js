enyo.createMixin({
	name: "enyo.RowSupport",
	decorateEvent: function (name, event) {
		event.row = this;
		this.inherited(arguments);
	}
});
