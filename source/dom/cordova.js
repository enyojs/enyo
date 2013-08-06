/**
Listens for Cordova specific events

Events are exposed through the [Signals](#enyo.Signals) kind by adding callback handlers.

Example:

enyo.kind({
	name: "App",
	components: [
		{kind: "Signals", ondeviceready: "deviceready"},
		...
		],
	deviceready: function() {
	// Cordova API exists at this point forward
	}
});

List of Cordova events detailed on the [PhoneGap Docs](http://docs.phonegap.com/en/1.6.0/phonegap_events_events.md.html#Events)
*/
//* @protected
enyo.ready(function(){
	if (window.cordova || window.PhoneGap) {
		var pge = [
			"deviceready",
			"pause",
			"resume",
			"online",
			"offline",
			"backbutton",
			"localechange",
			"batterycritical",
			"batterylow",
			"batterystatus",
			"menubutton",
			"searchbutton",
			"startcallbutton",
			"endcallbutton",
			"volumedownbutton",
			"volumeupbutton",
			"webOSLaunch",
			"webOSRelaunch"
		];
		for (var i=0, e; (e=pge[i]); i++) {
			// some cordova events have no type, so enyo.dispatch fails
			document.addEventListener(e, enyo.bind(enyo.Signals, "send", "on" + e), false);
		}
	}
});
