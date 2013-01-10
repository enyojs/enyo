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
        location state of the browser.
    */
    enyo.kind({
        //*@public
        name: "enyo.Router",
        //*@protected
        kind: "enyo.Controller",
        //*@public
        listening: true,
        //*@public
        internalOnly: false,
        //*@protected
        staticRoutes: null,
        //*@protected
        dynamicRoutes: null,
        //*@public
        defaultRoute: null,
        //*@public
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
                if (!route || !route.path) continue;
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
