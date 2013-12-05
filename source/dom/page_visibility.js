/**
	Support for the W3C Page Visibility API - http://www.w3.org/TR/page-visibility

	enyo.hidden and enyo.visibilityState contain the same information as
	document.hidden and document.visibilityState in supported browsers. The
	visibilitychange event is channelled through the [Signals](#enyo.Signals)
	mechanism.

	Partly based on http://stackoverflow.com/a/1060034.

	Example:

	enyo.kind({
		name: "App",
		components: [
			{kind: "Signals", onvisibilitychange: "visibilitychanged"}
		],
		visibilitychanged: function() {
			if(enyo.hidden){
				// page hidden
			} else {
				// page visible
			}
		}
	});
*/
//* @protected
enyo.ready(function(){
	var hidden = "hidden";
	var visibilityState = "visibilityState";

	// map compatibility events to document.hidden state
	var hiddenMap = {};
	hiddenMap.blur = hiddenMap.focusout = hiddenMap.pagehide = true;
	hiddenMap.focus = hiddenMap.focusin = hiddenMap.pageshow = false;

	function onchange(inEvent) {
		inEvent = inEvent || window.event;
		enyo.hidden = (inEvent.type in hiddenMap) ? hiddenMap[inEvent.type] : document[hidden];
		enyo.visibilityState = (inEvent.type in hiddenMap) ? (hiddenMap[inEvent.type] ? "hidden" : "visible" ) : document[visibilityState];
		enyo.Signals.send("onvisibilitychange", enyo.mixin(inEvent, {hidden: enyo.hidden}));
	}

	// Standards:
	if (hidden in document){
		document.addEventListener("visibilitychange", onchange);
	} else if ((hidden = "mozHidden") in document){
		document.addEventListener("mozvisibilitychange", onchange);
		visibilityState = "mozVisibilityState";
	} else if ((hidden = "webkitHidden") in document){
		document.addEventListener("webkitvisibilitychange", onchange);
		visibilityState = "webkitVisibilityState";
	} else if ((hidden = "msHidden") in document){
		document.addEventListener("msvisibilitychange", onchange);
		visibilityState = "msVisibilityState";
	} else if ("onfocusin" in document){ // IE 9 and lower:
		document.onfocusin = document.onfocusout = onchange;
	} else { // All others:
		window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
	}

	// set inital values for enyo.hidden and enyo.visibilityState
	// it's probably save to assume that the current document is visible when
	// loading the page
	enyo.hidden = typeof document[hidden] !== "undefined" ? document[hidden] : false;
	enyo.visibilityState = typeof document[visibilityState] !== "undefined" ? document[visibilityState] : "visible";
});
