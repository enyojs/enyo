enyo.kind({
	name: "enyo.DragAvatar",
	kind: enyo.Control,
	kindStyle: "position: absolute; z-index: 10;",
	showing: false,
	create: function() {
		this.inherited(arguments);
		// FIXME: make a css-class
		this.addStyles(this.kindStyle);
	},
	rendered: function() {
		this.inherited(arguments);
		// NOTE: moving the node means we need special teardown below
		document.body.appendChild(this.hasNode());
	},
	teardownRender: function() {
		document.body.removeChild(this.hasNode());
		this.inherited(arguments);
	},
	drag: function(inEvent) {
		//this.boxToNode({l: inEvent.pageX + 20, t: inEvent.pageY - 50});
		this.setBounds({top: inEvent.pageY - 50, left: inEvent.pageX + 20});
		this.show();
	},
	showingChanged: function() {
		this.inherited(arguments);
		document.body.style.cursor = this.showing ? "move" : null;
	}
});

