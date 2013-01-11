enyo.ready(function () {
    
    //*@protected
    // each router registers with this list
    var listeners = [];
    //*@protected
    // this method is registered as the handler for occasions when
    // the hash change event is fired
    var hashDidChange = function (hash) {
        var list = enyo.cloneArray(listeners);
        var router;
        while (list.length) {
            router = list.shift();
            router.hashChanged(hash);
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
        For the browsers we actively support, they all support this
        method of registering for hashchange events.
    */
    enyo.dispatcher.listen(window, "hashchange", hashDidChange);
    
    //*@public
    /**
        The _enyo.Router_ is a kind of controller with the ability to
        interpret changes in the url as well as set changes to the url
        in a cross-browser compatible way. With defined route handling
        state of the application can be managed more closely with the
        location state of the browser. There can be more than one router
        active at any time. Routers _only interact with the hash portion
        of the browser location and will not force a reload of the current
        page_.
        
        Routes can be defined one of several ways and can be added at
        startup and/or later programmatically.
        
        A route is a declarative hash that has the following structure:
        
        {path: "some/path", handler: "function", context: "context"}
        
        The path is a string that can be static (explicitly matched) or
        dynamic (matched based on dynamic placeholders). Dynamic paths
        can name elements that will be matched, e.g. {path: ":user/:id"}
        and the handler would be called with 2 parameters filled with the values
        matched by that structure. It is important to note that dynamic
        routes will apply the first match it finds so care must be used to ensure
        the correct route will always be matched (e.g. /users/:user/:id is
        more exact because of the static 'users' portion of the path).
        
        The handler can be a function reference or a string that will be
        mapped to a function first by checking the existence of the function
        on the router, then on any provided context and then in the global
        scope. If a context is provided, the function will be executed under
        that context regardless of where the function was found.
        
        The context property can be an object, an instance or a string that will
        be mapped to an object if possible.
        
        NOTE: Because we support IE8 we do not currently support _pushState_.
        NOTE: Dynamic routes currently only support letters and numbers.
    */
    enyo.kind({
        //*@public
        name: "enyo.Router",
        //*@protected
        kind: "enyo.Controller",
        //*@public
        /**
            If the router is listening it will respond to hash changes or
            internal events. If this flag is set to false it will stop
            responding. This can be changed at any time.
        */
        listening: true,
        //*@public
        /**
            If this is set to true it will not respond to hash changes in
            the browser or be able to trigger them. Instead it could be
            used internally to maintain or trigger state changes in an
            application without changing location.
        */
        internalOnly: false,
        //*@protected
        staticRoutes: null,
        //*@protected
        dynamicRoutes: null,
        //*@public
        /**
            The _defaultRoute_ should have the same structure as a normal
            route (hash). It can be arbitrarily assigned to this property
            or mixed in to the routes array with a special _default: true_
            flag set. For any unmatched hash changes this route will be
            executed and passed the path that was not matched.
        */
        defaultRoute: null,
        //*@public
        /**
            By default a router will attempt to trigger the correct route
            for the current browser location when it is created. Set this
            to false to keep it from performing this startup routine.
        */
        triggerOnStart: true,
        //*@protected
        current: "",
        //*@public
        /**
            The _routes_ object constitutes the handlers for this router.
            Routes are string paths, static or dynamic, that route particular
            hash-change events. 
        */
        routes: null,
        //*@public
        /**
            Trigger a change without necessarily requiring a change to
            occur. If called without a parameter it will force the
            route that matches the current browser location to fire.
            If a string is passed to this method it will trigger an
            internal only event (will not change the browser location).
            If it is passed a hash, it will try to use a _location_ property
            while looking for optional _change_ and _global_ properties.
            If the _change_ property is present and true it will force a
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
        location: enyo.Computed(function (loc) {
            if (loc) {
                loc = prepare(loc);
                if (!this.internalOnly) {
                    window.location.hash = loc;
                } else this.set("current", loc);
            } else {
                return prepare(this.get("current"));
            }
        }, "current"),
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
            // if the handler is defined as a string we need to determine if
            // it is relative to the router, relative to the context, or a named
            // function in the global scope
            if ("string" === typeof handler) {
                if (context) {
                    if ("string" === typeof context) {
                        context = enyo.getPath(context);
                    }
                } else context = this;
                // first check to see if the handler is a named property
                // on the router otherwise try the context itself
                fn = this[handler] || context[handler];
                if ("function" === typeof fn) {
                    // in the case we actually found it, lets not go hunting
                    // next time
                    route.handler = fn;
                    route.context = context;
                }
            }
            // if we have an actual handler, lets execute it now
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
                    // we need to strip the full match off so we can
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

});
