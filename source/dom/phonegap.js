/**
Listens for PhoneGap specific events

Events are exposed through the [Signals](#enyo.Signals) kind by adding callback handlers.

Example:

enyo.kind({
	name: "App",
	components: [
		{kind: "Signals", ondeviceready: "deviceready"},
		...
		],
	deviceready: function() {
	// PhoneGap API exists at this point forward
	}
});

List of PhoneGap events detailed on the [PhoneGap Docs](http://docs.phonegap.com/en/1.6.0/phonegap_events_events.md.html#Events)
*/
//* @protected
(function(){
	if (window.cordova || window.PhoneGap) {
		var pge = [
			"deviceready",
			"pause",
			"resume",
			"online",
			"offline",
			"backbutton",
			"batterycritical",
			"batterylow",
			"batterystatus",
			"menubutton",
			"searchbutton",
			"startcallbutton",
			"endcallbutton",
			"volumedownbutton",
			"volumeupbutton"
		];
		for (var i=0, e; e=pge[i]; i++) {
			// some phonegap events have no type, so enyo.dispatch fails
			document.addEventListener(e, enyo.bind(enyo.Signals, "send", "on" + e), false);
		}
	}
})();
