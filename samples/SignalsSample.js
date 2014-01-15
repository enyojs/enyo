enyo.kind({
	name: "enyo.sample.SignalsSample.app",
	kind: "enyo.Application",
	view: "enyo.sample.SignalsSample.view"
});

enyo.kind({
	name: "enyo.sample.SignalsSample.view",
	classes: "signals-sample",
	components: [
		{kind: "enyo.Button", ontap: "sendGlobalSignal", content: "send global signal"},
		{kind: "enyo.Button", ontap: "sendLocalSignal", content: "send local signal"},
		{name: "display", content: "Signal received", showing: false},
		{kind: "enyo.Signals", onreceive: "handleSignal"}
	],
	handleSignal: function(){
		this.showDisplay();
		this.startJob("hideDisplay", "hideDisplay", 600);
	},
	showDisplay: function(){
		this.$.display.show();
	},
	hideDisplay: function(){
		this.$.display.hide();
	},
	sendGlobalSignal: function(){
		enyo.Signals.send("onreceive", {});
	},
	sendLocalSignal: function(){
		enyo.Signals.send("onreceive", {_targetApp: this.app});
	}
});
