//* @protected

enyo.logging = {
	// log levels are integers from 0-99
	// 99 is maximum logging
	level: 99,
	// set level to -1 to disable all logging
	levels: {log: 20, warn: 10, error: 0},
	// return true if logging level is lower than the current log level
	shouldLog: function(inMethod) {
		var ll = parseInt(this.levels[inMethod], 0);
		return (ll <= this.level);
	},
	/*
	formatArgs: function(inMethod, inArgs) {
		var a$ = [];
		for (var i=0, l=inArgs.length, a; (a=inArgs[i]) || i<l; i++) {
			if (String(a) == "[object Object]") {
				a = enyo.json.stringify(a);
			}
			a$.push(a);
		}
		return a$;
	},
	*/
	_log: function(inMethod, inArgs) {
		// avoid trying to use console on IE instances where the object hasn't been
		// created due to the developer tools being unopened
		if (typeof console === "undefined") {
            return;
        }
		//var a$ = enyo.logging.formatArgs(inMethod, inArgs);
		var a$ = enyo.isArray(inArgs) ? inArgs : enyo.cloneArray(inArgs);
		if (enyo.dumbConsole) {
			// at least in early versions of webos, console.* only accept a single argument
			a$ = [a$.join(" ")];
		}
		var fn = console[inMethod];
		if (fn && fn.apply) {
			// some consoles support 'warn', 'info', and so on
			fn.apply(console, a$);
		} else if (console.log.apply) {
			// some consoles support console.log.apply
			console.log.apply(console, a$);
		} else {
			// otherwise, do our own formatting
			console.log(a$.join(" "));
		}
	},
	log: function(inMethod, inArgs) {
		if (typeof console !== "undefined") {
			if (this.shouldLog(inMethod)) {
				this._log(inMethod, inArgs);
			}
		}
	}
};

//* @public

/**
	Sets the log level for this window if the input is a real number.

	The log level is used as a watermark to control the amount of logging.
	Setting the log level lower will prevent logging functions with a higher
	level from being executed.

	The default log level is 99.  <a href="#enyo.log">enyo.log</a> will output
	if the level is 20 or above, <a href="#enyo.warn">enyo.warn</a> at 10, and
	<a href="#enyo.error">enyo.error</a> at 0.
*/
enyo.setLogLevel = function(inLevel) {
	var ll = parseInt(inLevel, 0);
	if (isFinite(ll)) {
		enyo.logging.level = ll;
	}
};

/**
	Sends a log message to the console, if the current log level allows for it.

	Objects are converted to JSON automatically.

	Multiple arguments are coerced to String and joined with spaces.
*/
enyo.log = function() {
	enyo.logging.log("log", arguments);
};

//* Same as _log_, except uses the console's warn method (if it exists).
enyo.warn = function() {
	enyo.logging.log("warn", arguments);
};

//* Same as _log_, except uses the console's error method (if it exists).
enyo.error = function() {
	enyo.logging.log("error", arguments);
};