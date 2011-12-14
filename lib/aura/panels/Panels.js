/*
	FIXME: not a good enough reason to exist
*/
enyo.kind({
	name: "enyo.Panels",
	kind: "Control",
	create: function() {
		this.panels = [];
		this.inherited(arguments);
	},
	addControl: function(inControl) {
		this.inherited(arguments);
		if (this.isPanel(inControl)) {
			this.addPanel(inControl);
		}
	},
	removeControl: function(inControl) {
		this.inherited(arguments);
		if (this.isPanel(inControl)) {
			this.removePanel(inControl);
		}
	},
	isPanel: function(inControl) {
		return inControl instanceof enyo.constructorForKind(this.defaultKind);
	},
	addPanel: function(inPanel) {
		this.panels.push(inPanel);
	},
	removePanel: function(inPanel) {
		enyo.remove(inPanel, this.panels);
	},
	handlePanelHidden: function(inPanel) {
		if (!inPanel.fire("onHidden")) {
			inPanel.broadcastMessage("hidden");
		}
	},
	handlePanelShown: function(inPanel) {
		if (!inPanel.fire("onShown")) {
			inPanel.broadcastMessage("shown");
		}
	}
});