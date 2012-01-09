enyo.kind({
	name: "enyo.HLayout",
	kind: enyo.Layout,
	layoutClass: "enyo-hlayout",
	//* @protected
	constructor: function(inContainer) {
		this.inherited(arguments);
		if (inContainer.align) {
			inContainer.domStyles['text-align'] = inContainer.align;
		}

	}
});

