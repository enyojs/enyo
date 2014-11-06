(function(enyo, scope) {

	/**
	* Any instance of a router will be referenced here for the global hash change handler.
	* 
	* @private
	*/
	var listeners = [];

	/**
	* This is the intended global `window.hashchange` event handler. If another handler is
	* arbitrarily registered for this event, then it will not fire.
	* 
	* @private
	*/
	var hashDidChange = function (hash) {
		var list = listeners;
		var len = list.length;
		var idx = 0;
		for (; idx < len; ++idx) {
			list[idx]._hashChanged(hash);
		}
	};

	/*
	* @private
	*/
	var token = /\:[a-zA-Z0-9]*/g;

	/*
	* @private
	*/
	var prepare = function (str) {
		return str[0] === '#'? str.slice(1): str;
	};

	/**
	* All of our actively-supported browsers support this method of registering
	* for `hashchange` events.
	* 
	* @private
	*/
	enyo.ready(function () {
		enyo.dispatcher.listen(window, 'hashchange', hashDidChange);
	});

	/**
	* {@link enyo.Router} is a controller with the ability to interpret changes in
	* the URL and make changes to the URL in a manner that is compatible across
	* browsers. With defined route handling, the application state can be managed
	* more closely with respect to the location state of the browser. There may be
	* multiple router instances active at any one time. Routers only interact with
	* the hash portion of the browser location and will not force a reload of the
	* current page.
	*
	* [Routes]{@link enyo.Router#routes} may be defined in several ways and
	* may be added at startup or [added programmatically]{@link enyo.Router#addRoute}
	* at a later time.
	*
	* A route is a declarative hash with the following structure:
	*
	* ```
	* {path: 'some/path', handler: 'function', context: 'context'}
	* ```
	*
	* The `path` is a string that may be static (explicitly matched) or dynamic
	* (matched based on dynamic placeholders). Dynamic paths may name elements to
	* be matched, e.g.:
	*
	* ```
	* {path: ':user/:id'}
	* ```
	*
	* In this case, `handler` would be called with two parameters filled with
	* the values matched by that structure. It is important to note that a dynamic
	* route will apply the first match it finds, so care must be taken to ensure
	* that the correct route is matched (e.g., `/users/:user/:id` is more exact
	* because it includes the static `users` portion of the path).
	*
	* `handler` may be a function reference or a string that will be mapped to a
	* function. A check for the function's existence is conducted first on the
	* router, then on any provided context, and finally in the global scope. If a
	* context is provided, the function will be executed under that context
	* regardless of where the function was found.
	*
	* The `context` property may be an object, an instance, or a string that will
	* be mapped to an object, if possible.
	*
	* Note that, currently, only letters and numbers are supported in dynamic routes.
	* 
	* @class enyo.Router
	* @extends enyo.Controller
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Router.prototype */ {

		// ...........................
		// PUBLIC PROPERTIES

		/*
		* @public
		*/
		name: 'enyo.Router',

		/**
		* If `true`, the router will respond to hash changes or internal events. If this flag is set
		* to `false`, it will stop responding. This may be changed at any time.
		* 
		* @type {Boolean}
		* @default true
		* @public
		*/
		listening: true,

		/**
		* If `true`, the router will neither respond to hash changes in the browser
		* nor be able to trigger them. Instead, the router may be used internally to
		* maintain or trigger state changes in an application without changing
		* location.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		internalOnly: false,

		/**
		* Set this to `true` to force the current browser location to a particular
		* path on startup. This flag will be ignored if
		* [triggerOnStart]{@link enyo.Router#triggerOnStart} is `false`.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		defaultPathOnStart: false,

		/**
		* The `defaultRoute` should have the same structure as a normal route (hash). It may be
		* arbitrarily assigned to this property or mixed into the
		* [routes]{@link enyo.Router#routes} array with a special `default: true` flag set. For
		* any unmatched hash changes, this route will be executed and passed the path that was not
		* matched.
		* 
		* @type {Object}
		* @default null
		* @public
		*/
		defaultRoute: null,

		/**
		* By default, when a router is created, it will attempt to trigger the correct route for the
		* current browser location. Set this flag to `false` to prevent this behavior.
		* 
		* @type {Boolean}
		* @default true
		* @public
		*/
		triggerOnStart: true,

		/**
		* The router will attempt to track history based on the events that have been generated
		* through it. This allows the usage of the browser's 'Back' and 'Forward' buttons.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		useHistory: false,

		/**
		* The `routes` [array]{@glossary Array} specifies the handlers for
		* the current Router instance. Routes are string paths, static or dynamic,
		* that route particular `hashchange` events. They are defined in an array of
		* [hashes]{@glossary Object} with a `handler` (function name), `path`
		* (for static and dynamic paths), an optional `context` (for the `handler`),
		* or a `default` Boolean `true`|`false` value indicating whether the handler
		* should be used when no other route can handle the `hashchange` event.
		* 
		* @example
		* routes: [
		*     {path: 'users/:userName', handler: 'loadUser'},
		*     {path: 'users', handler: 'usersIndex'},
		*     {path: 'about/moreDetail', handler: 'detailedAboutScreen'},
		*     {path: 'about', handler: 'aboutScreen'},
		*     {path: 'home', handler: 'homeScreen', default: true},
		*     {path: '', handler: 'handleBlankRoute'}
		* ]
		* 
		* @type {Array}
		* @public
		*/
		routes: null,

		// ...........................
		// PROTECTED PROPERTIES

		/*
		* @private
		*/
		kind: 'enyo.Controller',

		/*
		* @private
		*/
		_staticRoutes: null,

		/*
		* @private
		*/
		_dynamicRoutes: null,

		/*
		* @private
		*/
		_current: '',

		/*
		* @private
		*/
		_history: null,

		// ...........................
		// COMPUTED PROPERTIES
		
		computed: [
			{method: 'location', path: '_current', config: {cached: true}},
			{method: 'defaultPath'}
		],

		/**
		* A computed property that returns the location as known by this router. This property
		* will be synchronized with [window.location.hash]{@glossary window.location}
		* unless the [internalOnly]{@link enyo.Router#internalOnly} flag is set to `true`.
		* Passing a string to this property via `_set('location', 'mylocation')` will update the
		* inner location known by this router.
		*
		* @public
		*/
		location: function (loc) {
			if (loc) {
				loc = prepare(loc);
				if (!this.internalOnly) {
					enyo.asyncMethod(this, 'trigger', {location: loc, change: true});
				} else {
					this.set('_current', loc);
				}
			} else {
				return prepare(this.get('_current'));
			}
		},

		/**
		* Returns the string for the default path, or an empty string if no default
		* path exists.
		*
		* @public
		*/
		defaultPath: function () {
			return this.defaultRoute ? this.defaultRoute.path: '';
		},

		// ...........................
		// PUBLIC METHODS

		/**
		* Triggers a change without necessarily requiring a change to occur. If
		* called without a parameter, it will force the route that matches the
		* current browser location to fire. If a string is passed in, this method
		* will trigger an internal-only event (i.e., the browser location will not
		* be changed). If it is passed a hash, the method will try to use a
		* `location` property while looking for optional `change` and `global`
		* properties.
		*
		* If the `change` property is present and `true`, it will force a
		* [location.hash]{@glossary window.location} change in the
		* browser (this is always global). If the `global` property is present and
		* `true` and `change` is not present or `false`, it will trigger an internal
		* event that all routers will respond to (not just this instance).
		*
		* @public
		*/
		trigger: function (params) {
			if (!params) {
				params = {location: this.get('_current')};
			} else if ('string' === typeof params) {
				params = {location: params};
			}
			var loc = params.location;
			var global = params.global;
			var change = params.change;
			var current = this.get('location');
			if (change) {
				if (current !== loc) {
					window.location.hash = loc;
				} else {
					this._hashChanged(loc);
				}
			} else {
				if (global) {
					hashDidChange(loc);
				} else {
					this._hashChanged(loc);
				}
			}
		},

		/**
		* In very rare circumstances, it may be useful to pass a path to the
		* [routes]{@link enyo.Router#routes} without using
		* [trigger()]{@link enyo.Router#trigger} or global hash changes with
		* `path` being a string that will be evaluated against the routes owned by
		* this router.
		*
		* @param {String} path - A path to test against this router's
		*	[routes]{@link enyo.Router#routes}.
		* @public
		*/
		handle: function (path) {
			// fast track is to check against static routes first
			if (this._handleStatic(path)) {
				return;
			}
			// then we check against dynamic paths in this simple scheme
			else if (this._handleDynamic(path)) {
				/* do nothing */
			}
			else {
				this._handleDefault(path);
			}
		},

		/**
		* If history is enabled and some history exists, attempts to revert the
		* current known location to the previous one in the stack.
		*
		* @public
		*/
		back: function () {
			if (this.useHistory) {
				if (this._history.length >= 2) {
					// we shift the current location off the stack
					this._history.shift();
					// we shift the requested location off the stack
					// but reapply it
					this.set('location', this._history.shift());
				}
			}
		},

		/**
		* Arbitrarily adds history. The optional second parameter may be set to a
		* boolean `true` to add the location at the lowest (first) position in the
		* stack, or to an integer indicating the exact position for the location in
		* the stack. If the index is out of bounds, the location will be added at
		* the lowest position (the same as if boolean `true` is passed as the second
		* parameter). Returns callee for chaining.
		*
		* @param {String} location - The location string to add to the history.
		* @param {(Number|Boolean)} [idx] - Position in the history stack where the
		* new location should be added. Pass `true` for the first/oldest position,
		* or a number indicating the index where the location should be added. If no
		* value (or `undefined`) is specified, the location will be added at the
		*	last/most-recent position in the history stack.
		* @returns {this} The callee for chaining.
		* @public
		*/
		addHistory: function (location, idx) {
			if (this.useHistory) {
				switch (typeof idx) {
				case 'undefined':
					this._history.unshift(location);
					break;
				case 'number':
					if (idx >= 0 && idx < this._history.length) {
						this._history.splice(idx, 0, location);
					}
					break;
				case 'boolean':
					this._history.push(location);
					break;
				}
			}
			return this;
		},

		/**
		* Clears any history the router has stored. Returns callee for chaining.
		*
		* @returns {this} The callee for chaining.
		* @public
		*/
		clearHistory: function () {
			this._history = [];
			return this;
		},

		/**
		* May be used to programmatically add [routes]{@link enyo.Router#routes}
		* to the router. `route` is a hash as described by the
		* [routes]{@link enyo.Router#routes} array. Returns callee for chaining.
		*
		* @param {Object} route - The route to add.
		* @returns {this} The callee for chaining.
		* @public
		*/
		addRoute: function (route) {
			var statics = this._staticRoutes;
			var dynamic = this._dynamicRoutes;
			var regex;
			if (true === route['default']) {
				this.defaultRoute = route;
			}
			else if (token.test(route.path)) {
				token.lastIndex = 0;
				// regex = new RegExp(route.path.replace(token, '([a-zA-Z0-9-]*)'));
				regex = new RegExp(route.path.replace(token, '([a-zA-Z0-9-.]*)'));
				route.regex = regex;
				dynamic.push(route);
			} else {
				statics[route.path] = route;
			}
			return this;
		},

		// ...........................
		// PROTECTED METHODS

		/*
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				this._staticRoutes = {};
				this._dynamicRoutes = [];
				this.routes = this.routes || [];
				this._history = this._history || [];
				sup.apply(this, arguments);
			};
		}),

		/*
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				// make sure to initialize our routes prior
				// to registering for events
				this._setupRoutes();
				// make sure we're up to date
				this.set('_current', prepare(window.location.hash));
				// ok, register for events
				listeners.push(this);
				// ok, if we need to go ahead and route our current
				// location, lets do it, but let create finish first
				if (this.triggerOnStart) {
					if (this.defaultPathOnStart) {
						enyo.asyncMethod(this, 'trigger', {change: true, location: this.get('defaultPath')});
					} else {
						enyo.asyncMethod(this, 'trigger');

					}
				}
			};
		}),

		/*
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				var idx = enyo.indexOf(this, listeners);
				if (!~idx) {
					listeners.splice(idx, 1);
				}
				sup.apply(this, arguments);
			};
		}),

		/*
		* @private
		*/
		_hashChanged: function (hash) {
			var $hash = (function (prop) {
				if (!enyo.isString(prop)) {
					// some browsers do not support the newUrl property
					// so we're forced to look at the current hash
					prop = prop.newUrl || window.location.hash;
				}
				return prepare(prop);
			})(hash);
			if (this.listening) {
				this.set('_current', $hash);
				this.handle($hash);
			}
		},

		/*
		* @private
		*/
		_execHandler: function (context, handler, args, route) {
			var $fn = handler;
			var $ctx = 'string' === typeof context? enyo.getPath.call(this, context): context;
			// if the handler is defined as a string, we need to determine if it is relative to the
			// router, relative to the owner, relative to the context, or a named function in the
			// global scope
			if ('string' === typeof handler) {
				if (typeof this[handler] === 'function') {
					$fn = this[handler];
					$ctx = $ctx || this;
				} else if (typeof this.owner[handler] === 'function') {
					$fn = this.owner[handler];
					$ctx = $ctx || this.owner;
				} else if (typeof $ctx[handler] === 'function') {
					$fn = $ctx[handler];
				}
				if ('function' === typeof $fn) {
					// in case we actually found it, let's not go hunting
					// next time
					route.handler = $fn;
					route.context = $ctx;
				}
			}
			// if we have an actual handler, let's execute it now
			if ($fn && 'function' === typeof $fn) {
				$fn.apply($ctx, args);
				return true;
			}
			// otherwise we couldn't determine what we were supposed to
			// do here
			return false;
		},

		/*
		* @private
		*/
		_handleStatic: function (path) {
			var statics = this._staticRoutes;
			var route;
			var handler;
			var context;
			if ((route = statics[path])) {
				handler = route.handler;
				context = route.context;
				return this._execHandler(context, handler, [path], route);
			}
			return false;
		},

		/*
		* @private
		*/
		_handleDynamic: function (path) {
			var dynamic = this._dynamicRoutes;
			var regex;
			var route;
			var handler;
			var context;
			var matches;
			var idx = 0;
			var len = dynamic.length;
			for (; idx < len; ++idx) {
				route = dynamic[idx];
				regex = route.regex;
				if ((matches = regex.exec(path))) {
					// we need to strip off the full match so we can
					// use the other matches as parameters
					matches = matches.slice(1);
					handler = route.handler;
					context = route.context;
					return this._execHandler(context, handler, matches, route);
				}
			}
			return false;
		},

		/*
		* @private
		*/
		_handleDefault: function (path) {
			var route = this.defaultRoute || {};
			var context = route.context;
			var handler = route.handler;
			return this._execHandler(context, handler, [path], route);
		},

		/*
		* @private
		*/
		_setupRoutes: function () {
			var routes = this.routes;
			var idx = 0;
			var len = routes.length;
			var route;
			for (; idx < len; ++idx) {
				route = routes[idx];
				if (!route) {
					continue;
				}
				this.addRoute(route);
			}
		},

		/*
		* @private
		*/
		_currentChanged: function () {
			if (this.useHistory) {
				this._history.unshift(this.get('location'));
			}
		}

	});

})(enyo, this);
