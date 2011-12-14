//* @protected
enyo.kind({
	name: "enyo.SwitchedButton",
	kind: enyo.CustomButton,
	published: {
		switched: false
	},
	create: function() {
		this.inherited(arguments);
		this.switchedChanged();
	},
	toggleSwitched: function() {
		this.setSwitched(!this.switched);
	},
	switchedChanged: function(inSwitched) {
		this.stateChanged("switched");
	}
});
