/*
	Copyright 2014 LG Electronics, Inc.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
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

		// deviceready is dispatched using DOM mechanisms, others need to be registered after
		// that fires to use the Cordova-supplied addEventListener override
		document.addEventListener("deviceready", function(inEvent) {

			// setup the other signal repeaters for Cordova events
			var pge = [
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
			for (var i=0, e; (e=pge[i]); i++) {
				// some cordova events have no type, so enyo.dispatch fails
				document.addEventListener(e, enyo.bind(enyo.Signals, "send", "on" + e), false);
			}

			// go ahead and broadcast the signal for the "deviceready" event
			enyo.Signals.send("ondeviceready", inEvent);

		}, false);
	}
});
