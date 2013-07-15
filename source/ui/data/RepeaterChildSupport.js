enyo.createMixin({
	name: "enyo.RepeaterChildSupport",
	decorateEvent: function (sender, event) {
		event.model = this.model;
		event.child = this;
		this.inherited(arguments);
	}
});
