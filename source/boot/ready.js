(function (scope, enyo) {

	// we need to register appropriately to know when
	// the document is officially ready, to ensure that
	// client code is only going to execute at the
	// appropriate time

	var doc = scope.document;
	var queue = [];
	var ready = ("complete" === doc.readyState);
	var run;
	var init;
	var remove;
	var add;
	var flush;
	var flushScheduled = false;

	//*@public
	/**
		Register a callback (and optional "this" context) to run
		after all the enyo and library code has loaded and the DOMContentLoaded
		(or equivalent on older browsers) event has been sent.

		If called after system is in a ready state, run the supplied code
		asynchronously at earliest opportunity.
	*/
	enyo.ready = function (fn, context) {
		queue.push([fn, context]);
		// schedule another queue flush if needed to run new ready calls
		if (ready && !flushScheduled) {
			enyo.asyncMethod(window, flush);
			flushScheduled = true;
		}
	};

	//*@protected
	run = function (fn, context) {
		fn.call(context || enyo.global);
	};

	init = function (event) {
		// if we're interactive, it should be safe to move
		// forward because the content has been parsed
		if ((ready = ("interactive" === doc.readyState))) {
			if (!~enyo.indexOf(event.type, ["DOMContentLoaded", "readystatechange"])) {
				remove(event.type, init);
				flush();
			}
		}
		// for an IE8 fallback and legacy WebKit (including webOS 3.x and less) and assurance
		if ((ready = ("complete" === doc.readyState || "loaded" === doc.readyState))) {
			remove(event.type, init);
			flush();
		}
	};

	add = function (event, fn) {
		var name = doc.addEventListener? "addEventListener": "attachEvent";
		var on = name === "attachEvent"? "on": "";
		doc[name](on + event, fn, false);
	};

	remove = function (event, fn) {
		var name = doc.addEventListener? "removeEventListener": "detachEvent";
		var on = name === "detachEvent"? "on": "";
		doc[name](on + event, fn, false);
	};

	flush = function () {
		if (ready && queue.length) {
			while (queue.length) {
				run.apply(scope, queue.shift());
			}
		}
		flushScheduled = false;
	};

	// ok, let's hook this up
	add("DOMContentLoaded", init);
	add("readystatechange", init);

})(window, enyo);
