(function (enyo) {

	//*@protected
	/**
		Any instance of a router will be referenced here for the global
		hash change handler.
	*/
	var listeners = [];

	//*@protected
	/**
		This is the intended global _window.hashchange_ event handler. If
		another handler is arbitrarily registered for this event, then it
		will not fire.
	*/
	var hashDidChange = function (hash) {
		var list = listeners;
		var len = list.length;
		var idx = 0;
		for (; idx < len; ++idx) {
			list[idx]._hashChanged(hash);
		}
	};

	//*@protected
	var token = /\:[a-zA-Z0-9]*/g;

	//*@protected
	var prepare = function (str) {
		return str[0] === "#"? str.slice(1): str;
	};

	//*@protected
	/**
		All of our actively-supported browsers support this method of
		registering for _hashchange_ events.
	*/
	enyo.ready(function () {
		enyo.dispatcher.listen(window, "hashchange", hashDidChange);
	});

	//*@public
	/**
		_enyo.Router_ is a controller with the ability to interpret changes
		in the url as well as set changes to the url in a manner that is
		compatible across browsers. With defined route handling, the
		application state can be managed more closely with respect to the
		location state of the browser. There may be multiple router instances
		active at any one time. Routers only interact with the hash portion
		of the browser location and will not force a reload of the current
		page.

		Routes may be defined in several ways and may be added at startup or
		added programmatically at a later time.

		A route is a declarative hash with the following structure:

			{path: "some/path", handler: "function", context: "context"}

		The path is a string that may be static (explicitly matched) or
		dynamic (matched based on dynamic placeholders). Dynamic paths
		may name elements to be matched, e.g.:

			{path: ":user/:id"}

		In this case, the handler would be called with two parameters
		filled with the values matched by that structure. It is important
		to note that a dynamic route will apply the first match it finds,
		so care must be used to ensure that the correct route is matched
		(e.g., _/users/:user/:id_ is more exact because of the static
		_users_ portion of the path).

		The handler may be a function reference or a string that will be
		mapped to a function. A check for the function's existence is
		conducted first on the router, then on any provided context, and
		finally in the global scope. If a context is provided, the
		function will be executed under that context regardless of where
		the function was found.

		The context property may be an object, an instance or a string that
		will be mapped to an object if possible.

		Note that, currently, only letters and numbers are supported in
		dynamic routes.
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.Router",

		//*@public
		/**
			If true, the router will respond to hash changes or internal events.
			If this flag is set to false, it will stop responding. This may be
			changed at any time.
		*/
		listening: true,

		//*@public
		/**
			If true, the router will neither respond to hash changes in the
			browser nor be able to trigger them. Instead, it may be used
			internally to maintain or trigger state changes in an application
			without changing location.
		*/
		internalOnly: false,

		//*@public
		/**
			If the desire is to force the current browser location to a particular
			path on startup set this value to true. Will be ignored if _triggerOnStart_
			is false.
		*/
		defaultPathOnStart: false,

		//*@public
		/**
			The _defaultRoute_ should have the same structure as a normal
			route (hash). It may be arbitrarily assigned to this property
			or mixed into the routes array with a special _default: true_
			flag set. For any unmatched hash changes, this route will be
			executed and passed the path that was not matched.
		*/
		defaultRoute: null,

		//*@public
		/**
			By default, when a router is created, it will attempt to trigger
			the correct route for the current browser location. Set this
			to false to prevent this from happening.
		*/
		triggerOnStart: true,

		//*@public
		/**
			The router will attempt to track history based on the events
			that have been generated through it.
		*/
		useHistory: false,

		//*@public
		/**
			The _routes_ array constitutes the handlers for this router.
			Routes are string paths, static or dynamic, that route particular
			_hashchange_ events. They are defined in an array of hashes with
			a _handler_ (function), _path_ (for static and dynamic paths), an
			optional _context_ (for the handler), or a _default_ boolean true|false
			where that handler will be used when no other route can handle the
			_hashchange_ event.
		*/
		routes: null,

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		kind: "enyo.Controller",

		//*@protected
		_staticRoutes: null,

		//*@protected
		_dynamicRoutes: null,

		//*@protected
		_current: "",

		//*@protected
		_history: null,

		// ...........................
		// COMPUTED PROPERTIES

		computed: {
			location: ["_current", {cached: true}],
			defaultPath: []
		},

		//*@public
		/**
			A computed property that will return the location as
			known by this router. This property will be synchronized
			with _window.location.hash_ unless its _internalOnly_
			flag is set to true. Passing a string to this property
			via _set("location", "mylocation")_ will update the inner
			location known by this router.
		*/
		location: function (loc) {
			if (loc) {
				loc = prepare(loc);
				if (!this.internalOnly) {
					enyo.asyncMethod(this, "trigger", {location: loc, change: true});
				} else {
					this.set("_current", loc);
				}
			} else {
				return prepare(this.get("_current"));
			}
		},

		//*@public
		/**
			Returns the string for the default path (if any; otherwise, an empty
			string).
		*/
		defaultPath: function () {
			return this.defaultRoute? this.defaultRoute.path: "";
		},

		// ...........................
		// PUBLIC METHODS

		//*@public
		/**
			Triggers a change without necessarily requiring a change to	occur.
			If called without a parameter, it will force the route that matches
			the current browser location to fire. If a string is passed in, this
			method will trigger an internal-only event (i.e., the	browser
			location will not be changed). If it is passed a hash, the method
			will try to use a _location_ property while looking for optional
			_change_ and _global_ properties.

			If the _change_ property is present and true, it will force a
			_location.hash_ change in the browser (this is always global).
			If the _global_ property is present and true and _change_ is
			not present or false, it will trigger an internal event that
			all routers will respond to (not just this instance).
		*/
		trigger: function (params) {
			if (!params) {
				params = {location: this.get("_current")};
			} else if ("string" === typeof params) {
				params = {location: params};
			}
			var loc = params.location;
			var global = params.global;
			var change = params.change;
			var current = this.get("location");
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

		//*@public
		/**
			In very rare circumstances, it may be useful to pass a path
			to the routes without using _trigger()_ or global hash changes
			with _path_ being a string that will be evaluated against
			the routes owned by this router.
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

		//*@public
		/**
			If history is enabled and some history exists, attempts
			to revert the current known location to the previous one in
			the stack.
		*/
		back: function () {
			if (this.useHistory) {
				if (this._history.length >= 2) {
					// we shift the current location off the stack
					this._history.shift();
					// we shift the requested location off the stack
					// but reapply it
					this.set("location", this._history.shift());
				}
			}
		},

		//*@public
		/**
			Arbitrarily adds history. Optional second parameter can be
			a boolean true to place the location at the lowest (first) position
			of the stack, or an integer indicating its exact location in the
			stack. If the index is out of bounds, it will be added at the lowest
			position (same as boolean true for second parameter). Returns callee
			for chaining.
		*/
		addHistory: function (location, idx) {
			if (this.useHistory) {
				switch (typeof idx) {
				case "undefined":
					this._history.unshift(location);
					break;
				case "number":
					if (idx >= 0 && idx < this._history.length) {
						this._history.splice(idx, 0, location);
					}
					break;
				case "boolean":
					this._history.push(location);
					break;
				}
			}
			return this;
		},

		//*@public
		/**
			Clears any history the router has currently stored. Returns
			callee for chaining.
		*/
		clearHistory: function () {
			this._history = [];
			return this;
		},

		//*@public
		/**
			Can be used to programmatically add routes to the router
			where _route_ is a hash as described by the _routes_ array.
			Returns callee for chaining.
		*/
		addRoute: function (route) {
			var statics = this._staticRoutes;
			var dynamic = this._dynamicRoutes;
			var regex;
			if (true === route['default']) {
				this.defaultRoute = route;
			}
			else if (token.test(route.path)) {
				regex = new RegExp(route.path.replace(token, "([a-zA-Z0-9-]*)"));
				route.regex = regex;
				dynamic.push(route);
			} else {
				statics[route.path] = route;
			}
			return this;
		},

		// ...........................
		// PROTECTED METHODS

		//*@protected
		constructor: enyo.inherit(function (sup) {
			return function () {
				this._staticRoutes = {};
				this._dynamicRoutes = [];
				this.routes = this.routes || [];
				this._history = this._history || [];
				sup.apply(this, arguments);
			};
		}),

		//*@protected
		create: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				// make sure to initialize our routes prior
				// to registering for events
				this._setupRoutes();
				// make sure we're up to date
				this.set("_current", prepare(window.location.hash));
				// ok, register for events
				listeners.push(this);
				// ok, if we need to go ahead and route our current
				// location, lets do it
				if (this.triggerOnStart) {
					if (this.defaultPathOnStart) {
						this.trigger({change: true, location: this.get("defaultPath")});
					} else {
						this.trigger();
					}
				}
			};
		}),

		//*@protected
		destroy: enyo.inherit(function (sup) {
			return function () {
				var idx = enyo.indexOf(this, listeners);
				if (!~idx) {
					listeners.splice(idx, 1);
				}
				sup.apply(this, arguments);
			};
		}),

		//*@protected
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
				this.set("_current", $hash);
				this.handle($hash);
			}
		},

		//*@protected
		_execHandler: function (context, handler, args, route) {
			var $fn = handler;
			var $ctx = "string" === typeof context? enyo.getPath.call(this, context): context || this;
			// if the handler is defined as a string, we need to determine if
			// it is relative to the router, relative to the context, or a named
			// function in the global scope
			if ("string" === typeof handler) {
				// first check to see if the handler is a named property
				// on the router; otherwise, try the context itself
				$fn = this[handler] || $ctx[handler];
				if ("function" === typeof $fn) {
					// in case we actually found it, let's not go hunting
					// next time
					route.handler = $fn;
					route.context = $ctx;
				}
			}
			// if we have an actual handler, let's execute it now
			if ($fn && "function" === typeof $fn) {
				$fn.apply($ctx, args);
				return true;
			}
			// otherwise we couldn't determine what we were supposed to
			// do here
			return false;
		},

		//*@protected
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

		//*@protected
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

		//*@protected
		_handleDefault: function (path) {
			var route = this.defaultRoute || {};
			var context = route.context;
			var handler = route.handler;
			return this._execHandler(context, handler, [path], route);
		},

		//*@protected
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

		//*@protected
		_currentChanged: function () {
			if (this.useHistory) {
				this._history.unshift(this.get("location"));
			}
		}

	});

}(enyo));
