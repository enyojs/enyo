(function (enyo, scope) {

	/**
	* Internally used methods and properties associated with logging.
	*
	* @namespace enyo.logging
	* @public
	*/
	enyo.logging = /** @lends enyo.logging */ {
		
		/**
		* The log level to use. Can be a value from -1 to 99, where -1 disables all
		* logging, 0 is 'error', 10 is 'warn', and 20 is 'log'. It is preferred that
		* this value be set using the [enyo.setLogLevel()]{@link enyo~setLogLevel}
		* method.
		*
		* @type {Number}
		* @default 99
		* @public
		*/
		level: 99,
		
		/**
		* The known levels.
		*
		* @private
		*/
		levels: {log: 20, warn: 10, error: 0},
		
		/**
		* @private
		*/
		shouldLog: function (fn) {
			var ll = parseInt(this.levels[fn], 0);
			return (ll <= this.level);
		},
		
		/**
		* @private
		*/
		validateArgs: function (args) {
			// gracefully handle and prevent circular reference errors in objects
			for (var i=0, l=args.length, item; (item=args[i]) || i<l; i++) {
				try {
					if (typeof item === 'object') {
						args[i] = enyo.json.stringify(item);
					}
				} catch (e) {
					args[i] = 'Error: ' + e.message;
				}
			}
		},
		
		/**
		* @private
		*/
		_log: function (fn, args) {
			// avoid trying to use console on IE instances where the object hasn't been
			// created due to the developer tools being unopened
			var console = window.console;
			if (typeof console === 'undefined') {
	            return;
	        }
			//var a$ = enyo.logging.formatArgs(fn, args);
			var a$ = enyo.isArray(args) ? args : enyo.cloneArray(args);
			if (enyo.platform.androidFirefox) {
				// Firefox for Android's console does not handle objects with circular references
				enyo.logging.validateArgs(a$);
			}
			if (enyo.dumbConsole) {
				// at least in early versions of webos, console.* only accept a single argument
				a$ = [a$.join(' ')];
			}
			var fn$ = console[fn];
			if (fn$ && fn$.apply) {
				// some consoles support 'warn', 'info', and so on
				fn$.apply(console, a$);
			} else if (console.log.apply) {
				// some consoles support console.log.apply
				console.log.apply(console, a$);
			} else {
				// otherwise, do our own formatting
				console.log(a$.join(' '));
			}
		},
		
		/**
		* This is exposed elsewhere.
		*
		* @private
		*/
		log: function (fn, args) {
			var console = window.console;
			if (typeof console !== 'undefined') {
				if (this.shouldLog(fn)) {
					this._log(fn, args);
				}
			}
		}
	};

	/**
	* Sets the log level to the given value. This will restrict the amount of output depending on
	* the settings. The higher the value, the more output that will be allowed. The default is
	* 99. The value, -1, would silence all logging, even 'error' (0).
	* Without the 'see': {@link enyo.log}.
	*
	* @see enyo.logging.level
	* @see enyo.log
	* @see enyo.warn
	* @see enyo.error
	* @param {Number} level - The level to set logging to.
	*/
	enyo.setLogLevel = function (level) {
		var ll = parseInt(level, 0);
		if (isFinite(ll)) {
			enyo.logging.level = ll;
		}
	};

	/**
	* A wrapper for [console.log()]{@glossary console.log}, compatible
	* across supported platforms. Will output only if the current
	* [log level]{@link enyo.logging.level} allows it. [Object]{@glossary Object}
	* parameters will be serialized via [JSON.stringify()]{@glossary JSON.stringify}
	* automatically.
	*
	* @utility
	* @see {@glossary console.log}
	* @param {...*} - The arguments to be logged.
	* @public
	*/
	enyo.log = function () {
		enyo.logging.log('log', arguments);
	};

	/**
	* A wrapper for [console.warn()]{@glossary console.warn}, compatible
	* across supported platforms. Will output only if the current
	* [log level]{@link enyo.logging.level} allows it. [Object]{@glossary Object}
	* parameters will be serialized via [JSON.stringify()]{@glossary JSON.stringify}
	* automatically.
	*
	* @utility
	* @see {@glossary console.warn}
	* @param {...*} - The arguments to be logged.
	* @public
	*/
	enyo.warn = function () {
		enyo.logging.log('warn', arguments);
	};

	/**
	* A wrapper for [console.error()]{@glossary console.error}, compatible
	* across supported platforms. Will output only if the current
	* [log level]{@link enyo.logging.level} allows it. [Object]{@glossary Object}
	* parameters will be serialized via [JSON.stringify()]{@glossary JSON.stringify}
	* automatically.
	*
	* @utility
	* @see {@glossary console.error}
	* @param {...*} - The arguments to be logged.
	* @public
	*/
	enyo.error = function () {
		enyo.logging.log('error', arguments);
	};

})(enyo, this);