(function (enyo, scope) {

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

	/**
	* Registers a callback (and optional `this` context) to run after all the Enyo and library code
	* has loaded and the `DOMContentLoaded` event (or equivalent on older browsers) has been sent.
    * 
	* If called after the system is in a ready state, runs the supplied code asynchronously at the
	* earliest opportunity.
	*
	* @name enyo.ready
	* @method
	* @param {Function} fn - The method to execute when the DOM is ready.
	* @param {Object} [context] - The optional context (`this`) under which to execute the
	*	callback method.
	* @public
	*/
	enyo.ready = function (fn, context) {
		queue.push([fn, context]);
		// schedule another queue flush if needed to run new ready calls
		if (ready && !flushScheduled) {
			setTimeout(flush, 0);
			flushScheduled = true;
		}
	};

	/**
	* @private
	*/
	run = function (fn, context) {
		fn.call(context || enyo.global);
	};

	/**
	* @private
	*/
	init = function (event) {
		// if we're interactive, it should be safe to move
		// forward because the content has been parsed
		if ((ready = ("interactive" === doc.readyState))) {
			if ("DOMContentLoaded" !== event.type && "readystatechange" !== event.type) {
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

	/**
	* @private
	*/
	add = function (event, fn) {
		var name = doc.addEventListener? "addEventListener": "attachEvent";
		var on = name === "attachEvent"? "on": "";
		doc[name](on + event, fn, false);
	};

	/**
	* @private
	*/
	remove = function (event, fn) {
		var name = doc.addEventListener? "removeEventListener": "detachEvent";
		var on = name === "detachEvent"? "on": "";
		doc[name](on + event, fn, false);
	};

	/**
	* @private
	*/
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

})(enyo, this);
