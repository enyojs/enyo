enyo.kind({
	name: "enyo.GroupItem",
	published: {
		active: false
	},
	create: function() {
		this.inherited(arguments);
		this.activeChanged();
	},
	activeChanged: function() {
		this.bubble("onActivate");
	}
});