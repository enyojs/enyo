/**
	A simple control for making lists of items.

	Components of Repeater are copied for each row created, wrapped in a control keeping state of the row index.

	Example:

		{kind: "Repeater", rows: 2, onSetupRow: "setImageSource", components: [
			{kind: "Image"}
		]}

		setImageSource: function(inSender, inEvent) {
			var index = inEvent.index;
			var rowControl = inEvent.row;
			rowControl.$.image.setSrc(this.imageSources[index]);
		}
*/
enyo.kind({
	name: "enyo.Repeater",
	kind: enyo.Control,
	published: {
		//* How many rows to render
		rows: 0
	},
	events: {
		//* Sends the row index, and the row control, for decoration
		onSetupRow: ""
	},
	//* @protected
	initComponents: function() {
		this.rowComponents = this.components || this.kindComponents;
		this.components = this.kindComponents = null;
		this.inherited(arguments);
	},
	//* @public
	//* Render the list
	build: function() {
		this.destroyClientControls();
		for (var i=0; i<this.rows; i++) {
			var c = this.createComponent({noDom: true, rowIndex: i});
			// do this as a second step so 'c' is the owner of the created components
			c.createComponents(this.rowComponents);
			this.doSetupRow({index: i, row: c});
		}
	}
});
