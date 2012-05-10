//* Base kind for the Grouping api
enyo.kind({
	name: "enyo.GroupItem",
	published: {
		active: false
	},
	//* @protected
	rendered: function() {
		this.inherited(arguments);
		this.activeChanged();
	},
	activeChanged: function() {
		this.bubble("onActivate");
	}
});
