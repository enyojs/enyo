enyo.kind({
	name: "enyo.Repeater",
	kind: enyo.Control,
	published: {
		/**
		Optionally decorate each row control with the row index, set via the "rowIndex" property.
		Decorating row items allows code to easily distinguish which row a control is in.
		*/
		shouldDecorateRows: true
	},
	events: {
		onSetupRow: ""
	},
	//* @protected
	generateInnerHtml: function() {
		this.build();
		return this.inherited(arguments);
	},
	build: function() {
		this.destroyClientControls();
		for (var i=0, config; config = this.doSetupRow(i); i++) {
			config = enyo.isArray(config) ? config : [config];
			if (this.shouldDecorateRows) {
				this.decorateRow(config, i);
			}
			this.createComponents(config, {owner: this.owner});
		}
	},
	decorateRow: function(inConfig, inIndex) {
		for (var i=0, c; c=inConfig[i]; i++) {
			c.rowIndex = inIndex;
		}
	}
});
