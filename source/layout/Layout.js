enyo.kind({
	name: "enyo.Layout",
	layoutClass: "",
	//* @protected
	constructor: function(inContainer) {
		this.container = inContainer;
		inContainer.addClasses(this.layoutClass);
	},
	destroy: function() {
		if (this.container) {
			this.container.removeClasses(this.layoutClass);
		}
	},
	// static-y property based layout
	flow: function() {
	},
	// dynamic-y measure based layout
	reflow: function() {
	}
});
