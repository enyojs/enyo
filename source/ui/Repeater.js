enyo.kind({
	name: "enyo.Repeater",
	kind: enyo.Control,
	published: {
		rows: 0
	},
	events: {
		onSetupRow: ""
	},
	initComponents: function() {
		this.rowComponents = this.components;
		this.components = null;
		this.inherited(arguments);
	},
	//* @protected
	generateInnerHtml: function() {
		//this.build();
		return this.inherited(arguments);
	},
	build: function() {
		this.destroyClientControls();
		for (var i=0; i<this.rows; i++) {
			var c = this.createComponent({kind: "NoDom", rowIndex: i});
			c.createComponents(this.rowComponents);
			this.doSetupRow({index: i, row: c});
		}
	},
	XdispatchEvent: function(inEventName, inEvent, inSender) {
		if (inSender && inSender.owner == this) {
			var delegate = inEvent.originator[inEventName];
			if (delegate && this.dispatch(this.owner, delegate, inEvent, inSender)) {
				return true;
			}
		}
		return this.inherited(arguments);
	}
});
