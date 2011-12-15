enyo.kind({
	name: "enyo.HLayout",
	layoutClass: "enyo-hlayout",
	flow: function () {},
	//* @protected
	constructor: function(inContainer) {
		this.container = inContainer;
		inContainer.addClass(this.layoutClass);
		if (inContainer.align) {
			inContainer.domStyles['text-align'] = inContainer.align;
		}
	},
	destroy: function() {
		if (this.container) {
			this.container.removeClass(this.layoutClass);
		}
	}
});

