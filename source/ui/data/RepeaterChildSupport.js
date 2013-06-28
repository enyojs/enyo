enyo.createMixin({
	name: "enyo.RepeaterChildSupport",
	decorateEvent: function (sender, event) {
		event.model = this.model;
		this.inherited(arguments);
	}
});
