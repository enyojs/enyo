enyo.kind({
	name: "enyo.HLayout",
	layoutClass: "enyo-hlayout",
	flow: function () {},
	//* @protected
	constructor: function(inContainer) {
		this.container = inContainer;
		inContainer.addClasses(this.layoutClass);
		if (inContainer.align) {
			inContainer.domStyles['text-align'] = inContainer.align;
		}
	},
	destroy: function() {
		if (this.container) {
			this.container.removeClasses(this.layoutClass);
		}
	}
});

