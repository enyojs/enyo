(function (enyo) {
	
	//*@protected
	// Each router registers with this list.
	var listeners = [];
	//*@protected
	// This method is registered as the handler for hashchange events.
	var hashDidChange = function (hash) {
		var list = listeners;
		var len = list.length;
		var idx = 0;
		for (; idx < len; ++idx) list[idx].hashChanged(hash);
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
		registering for hashchange events.
	*/
	enyo.ready(function () {enyo.dispatcher.listen(window, "hashchange", hashDidChange)});
	
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
		
		Routes may be defined in several ways and may be added at	startup or
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
		(e.g., `/users/:user/:id` is more exact because of the static
		`users` portion of the path).
		
		The handler may be a function reference or a string that will be
		mapped to a function. A check for the function's existence is
		conducted first on the router, then on any provided context, and
		finally in the global scope. If a context is provided, the
		function will be executed under that context regardless of where
		the function was found.
		
		The context property may be an object, an instance or a string that
		will be mapped to an object if possible.
		
		Note that, currently, only letters and numbers are supported in
		dynamic routes.  Also, because we support IE8, we do not currently
		support _pushState_.
	*/
	enyo.kind({
		//*@public
		name: "enyo.Router",
		//*@protected
		kind: "enyo.Controller",
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
		//*@protected
		staticRoutes: null,
		//*@protected
		dynamicRoutes: null,
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
		//*@protected
		current: "",
		//*@public
		/**
			The _routes_ object constitutes the handlers for this router.
			Routes are string paths, static or dynamic, that route particular
			hash change events.
		*/
		routes: null,
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
				params = {location: this.get("current")};
			} else if ("string" === typeof params) {
				params = {location: params};
			}
			var loc = params.location;
			var global = params.global;
			var change = params.change;
			if (change) {
				window.location.hash = loc;
			} else {
				if (global) hashDidChange(loc);
				else this.hashChanged(loc);
			}
		},
		//*@public
		/**
		*/
		location: enyo.computed(function (loc) {
			if (loc) {
				loc = prepare(loc);
				if (!this.internalOnly) {
					window.location.hash = loc;
				} else this.set("current", loc);
			} else {
				return prepare(this.get("current"));
			}
		}, "current", {cached: true}),
		//*@protected
		constructor: function () {
			this.staticRoutes = {};
			this.dynamicRoutes = [];
			this.inherited(arguments);
		},
		//*@protected
		create: function () {
			this.inherited(arguments);
			// make sure to initialize our routes prior
			// to registering for events
			this.setupRoutes();
			// make sure we're up to date
			this.set("current", prepare(window.location.hash));
			// ok, register for events
			listeners.push(this);
			// ok, if we need to go ahead and route our current
			// location, lets do it
			if (this.triggerOnStart) {
				this.trigger();
			}
		},
		//*@protected
		destroy: function () {
			var idx = listeners.indexOf(this);
			if (!~idx) {
				listeners.splice(idx, 1);
			}
			this.inherited(arguments);
		},
		//*@protected
		hashChanged: function (hash) {
			var hash = hash || prepare(window.location.hash);
			if ("string" !== typeof hash) hash = hash.newURL.split("#")[1];
			if (this.listening) {
				this.set("current", hash);
				this.handle(hash);
			}
		},
		//*@public
		handle: function (path) {
			// fast track is to check against static routes first
			if (this.handleStatic(path)) return;
			// then we check against dynamic paths in this simple scheme
			else if(this.handleDynamic(path));
			else this.handleDefault(path);
		},
		//*@protected
		execHandler: function (context, handler, args, route) {
			var fn = handler;
			// if the handler is defined as a string, we need to determine if
			// it is relative to the router, relative to the context, or a named
			// function in the global scope
			if ("string" === typeof handler) {
				if (context) {
					if ("string" === typeof context) {
						context = enyo.getPath(context);
					}
				} else context = this;
				// first check to see if the handler is a named property
				// on the router; otherwise, try the context itself
				fn = this[handler] || context[handler];
				if ("function" === typeof fn) {
					// in case we actually found it, let's not go hunting
					// next time
					route.handler = fn;
					route.context = context;
				}
			}
			// if we have an actual handler, let's execute it now
			if (fn && "function" === typeof fn) {
				fn.apply(context, args);
				return true;
			}
			// otherwise we couldn't determine what we were supposed to
			// do here
			return false;
		},
		//*@protected
		handleStatic: function (path) {
			var statics = this.staticRoutes;
			var route;
			var handler;
			var context;
			if ((route = statics[path])) {
				handler = route.handler;
				context = route.context;
				return this.execHandler(context, handler, [path], route);
			}
			return false;
		},
		//*@protected
		handleDynamic: function (path) {
			var dynamic = this.dynamicRoutes;
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
					return this.execHandler(context, handler, matches, route);
				}
			}
			return false;
		},
		//*@protected
		handleDefault: function (path) {
			var route = this.defaultRoute || {};
			var context = route.context;
			var handler = route.handler;
			return this.execHandler(context, handler, [path], route);
		},
		//*@protected
		setupRoutes: function () {
			var routes = this.routes;
			var idx = 0;
			var len = routes.length;
			var route;
			var regex;
			for (; idx < len; ++idx) {
				route = routes[idx];
				if (!route) continue;
				this.addRoute(route);
			}
		},
		//*@public
		addRoute: function (route) {
			var statics = this.staticRoutes;
			var dynamic = this.dynamicRoutes;
			var regex;
			if (true === route.default) this.defaultRoute = route;
			else if (token.test(route.path)) {
				regex = new RegExp(route.path.replace(token, "([a-zA-Z0-9]*)"));
				route.regex = regex;
				dynamic.push(route);
			} else statics[route.path] = route;
		}
	});

}(enyo));
