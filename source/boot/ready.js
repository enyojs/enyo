(function (scope, enyo) {

	// we need to register appropriately to know when
	// the document is officially ready, to ensure that
	// client code is only going to execute at the
	// appropriate time

	var doc = scope.document;
	var queue = [];
	var ready = false;
	var run;
	var init;
	var remove;
	var add;
	var flush;

	// start with a preloaded condition
	var conditions = { domLoaded: true };
	var numConditions = 1;

	//*@public
	/**
		Register a callback (and optional "this" context) to run
		after the DOM content has loaded and any other app preconditions
		are cleared.  Multiple callbacks can be registered across several
		calls to `enyo.ready`; they will be run in the order registered.

		If called after system is in a ready state, run the supplied code
		asynchronously at earliest opportunity.
	*/
	enyo.ready = function (fn, context) {
		if (ready) {
			enyo.asyncMethod(context || enyo.global, fn);
		}
		else {
			queue.push([fn, context]);
		}
	};

	//*@public
	/**
		Add a precondition to the set needed for `enyo.ready`-registered
		callbacks to the be called. This is intended for use by libraries
		that need to wait on some resource, like an external font being loaded,
		before their code can safely run.
	*/
	enyo.ready.require = function(flag) {
		if (!ready) {
			if (!conditions[flag]) {
				numConditions++;
			}
			conditions[flag] = true;
		}
	};

	//*@public
	/**
		Indicate that a precondition named _flag_ has been met. No
		`enyo.ready`-registed callbacks will be run until all required
		preconditons have been provided.
	*/
	enyo.ready.provide = function(flag) {
		if (!ready) {
			if (conditions[flag]) {
				numConditions--;
			}
			delete conditions[flag];
		}
		if (numConditions === 0) {
			ready = true;
			flush();
		}
	};

	//*@protected
	run = function (fn, context) {
		fn.call(context || enyo.global);
	};

	init = function (event) {
		// if we're interactive, it should be safe to move
		// forward because the content has been parsed
		if ("interactive" === doc.readyState) {
			if (!~enyo.indexOf(event.type, ["DOMContentLoaded", "readystatechange"])) {
				remove(event.type, init);
				enyo.ready.provide("domLoaded");
			}
		}
		// for an IE8 fallback and legacy WebKit (including webOS 3.x and less) and assurance
		if ("complete" === doc.readyState || "loaded" === doc.readyState) {
			remove(event.type, init);
			enyo.ready.provide("domLoaded");
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
	};

	// check to see if this code has been loaded after DOM is ready
	if ("complete" === doc.readyState) {
		enyo.ready.provide("domLoaded");
	}
	else {
		// ok, let's hook this up
		add("DOMContentLoaded", init);
		add("readystatechange", init);
	}

})(window, enyo);
