/**
_enyo.Object_ implements the Enyo framework's property publishing system, as
well as providing several utility functions for its subkinds.

Published properties are declared in a hash called _published_ within a call
to _enyo.kind_. Getter and setter methods are automatically generated for
properties declared in this manner. Also, by convention, the setter for a
published property will trigger an optional _&lt;propertyName&gt;Changed_ method
when called.

For more information, see the [documentation on Published
Properties](https://github.com/enyojs/enyo/wiki/Published-Properties) in the
Enyo Developer Guide.
*/
enyo.kind({
    name: "enyo.Object",
    //* @protected
    // has no base kind
    kind: null,
    //*@public
    // concatenated properties (default)
    concat: enyo.concat,
    //*@public
    /**
        An array of strings that represent a mixin to be applied
        to this class at the end of the constructor routine.
    */
    mixins: null,
    //*@public
    /**
        Set this flag to false to delay or keep this portion
        of the object setup from executing.
    */
    initBindings: true,
    //*@public
    /**
        Set this flag to false to delay or keep this portion
        of the object setup from executing.
    */
    initMixins: true,
    //*@public
    /**
        Set this flag to false to delay or keep this portion
        of the object setup from executing.
    */
    initObservers: true,
    //*@public
    // any mixins that have been applied to this object will have
    // their name in this array
    appliedMixins: null,
    //*@public
    /**
        Set this flag to false to delay or keep this portion
        of the object setup from executing.
    */
    initComputed: true,
    //*@public
    // the bindings for the object
    bindings: null,
    //*@public
    // the observers object
    observers: null,
    //*@public
    // the computed properties object
    computed: null,
    //*@public
    // The deafult binding kind to use unless overridden by
    // an individual binding definition
    defaultBindingKind: "enyo.Binding",
    constructor: function() {
        enyo._objectCount++;
        // while this setup initializes the object's bindings
        // and observers, often this level of inspection needs
        // to be re-run later in the routine by subkinds, to do
        // this arbitrarily they can set the appropriate flag
        // for any of the given steps to false and when appropriate
        // set the flag to true and re-call the setup method
        this.setup();
    },
    //*@protected
    constructed: function (props) {
        if (props) {
            for (var key in props) {
                if (!props.hasOwnProperty(key)) continue;
                this[key] = props[key];
            }
        }
    },
    //* @public
    //* Destroys object with passed-in name.
    destroyObject: function(inName) {
        if (this[inName] && this[inName].destroy) {
            this[inName].destroy();
        }
        this[inName] = null;
    },
    /**
        Sends a log message to the console, prepended with the name of the kind
        and method from which _log_ was invoked.  Multiple arguments are coerced
        to String and joined with spaces.

            enyo.kind({
                name: "MyObject",
                kind: enyo.Object,
                hello: function() {
                    this.log("says", "hi");
                    // shows in the console: MyObject.hello: says hi
                }
            });
    */
    log: function() {
        var acc = arguments.callee.caller;
        var nom = ((acc ? acc.nom : "") || "(instance method)") + ":";
        enyo.logging.log("log", [nom].concat(enyo.cloneArray(arguments)));
    },
    //* Same as _log_, except uses the console's warn method (if it exists).
    warn: function() {
        this._log("warn", arguments);
    },
    //* Same as _log_, except uses the console's error method (if it exists).
    error: function() {
        this._log("error", arguments);
    },
    //* @protected
    _log: function(inMethod, inArgs) {
        if (enyo.logging.shouldLog(inMethod)) {
            try {
                throw new Error();
            } catch(x) {
                enyo.logging._log(inMethod, [inArgs.callee.caller.nom + ": "].concat(enyo.cloneArray(inArgs)));
                enyo.log(x.stack);
            }
        }
    },
    //*@protected
    /**
        This method accepts a string property as its only parameter.
        The value of this property will be evaluated and if it is itself
        a string the object will attempt to be resolved. The goal is
        to determine of the the property is a constructor, an instance or
        nothing. See _lang.js#enyo.findAndInstance_ for more information.
        
        If a method exists of the form `{property}FindAndInstance` it will
        be used as the callback accepting two parameters, the constructor
        if it was found and the instance if it was found or created,
        respectively. This allows for those methods to be overloaded by
        subkinds.
    */
    findAndInstance: function (property) {
        // if there isn't a property do nothing
        if (!enyo.exists(property)) return;
        var fn = this[property + "FindAndInstance"];
        // if we have a callback bind it to the given object so that
        // it will be called under the correct context, if it has
        // already been bound this is harmless
        fn = enyo.exists(fn) && "function" === typeof fn? enyo.bind(this, fn): null;
        // go ahead and call the enyo scoped version of this method
        return enyo.findAndInstance.call(this, property, fn);
    },
    //*@protected
    /**
        Initialize any mixins that were set in the mixins array for
        the kind. Mixins are never applied more than once. Will not
        continue to execute if the _initMixins_ property of the object
        is set to false.
    */
    setupMixins: function (force) {
        if (false === this.initMixins && !force) return;
        // prevent this from being run more than once
        this.initMixins = false;
        if (!this.appliedMixins) this.appliedMixins = [];
        enyo.forEach(this.mixins || [], this.prepareMixin, this);
    },
    //*@protected
    /**
        Prepares the given mixin that can be a reference or a
        string to the mixin object and then applies it to the
        object using the instance _extend_ method.
    */
    prepareMixin: function (mixin) {
        if ("string" === typeof mixin) mixin = enyo.getPath(mixin);
        if (mixin) this.extend(mixin);
    },
    //*@protected
    /**
        This method is responsible for calling each of the startup
        routines in order. This includes bindings, observers, and computed-
        properties.
    */
    setup: function () {
        this.setupMixins();
        this.setupObservers();
        this.setupComputed();
        this.setupBindings();
    },
    //*@protected
    /**
        This method attempts to setup any bindings from the given
        bindings array. It will not create the same binding twice. If
        the initBindings property is false it will not execute.
    */
    setupBindings: function (force) {
        if (false === this.initBindings && !force) return;
        // prevent this from being executed again
        this.initBindings = false;
        // to keep from attempting to setup bindings twice
        // just refresh them if we've been here before
        if (true === this.didSetupBindings) return this.refreshBindings();
        // first grab the bindings block/array for the kind
        // remap those definitions to a different variable
        var kindBindings = this.bindings || [];
        var idx = 0;
        var len;
        var def;
        // initialize our new bindings array for the object
        // where we will store the actual binding references
        this.bindings = [];
        for (len = kindBindings.length; idx < len; ++idx) {
            def = kindBindings[idx];
            // this method already adds the bindings to our
            // bindings array
            this.binding(def);
        }
        // flag the object for having the bindings already setup
        this.didSetupBindings = true;
        // if there are any listeners for this event notify them
        this.notifyObservers("didSetupBindings");
        // cleanup by removing all listeners on this event note that
        // not passing the function/handler makes it remove any/all
        // for that property!
        this.removeObserver("didSetupBindings");
    },
    //*@public
    /**
        This method accepts any number of hashes to be used to
        create a binding who's owner is this object by default.
        Any binding who's owner has their destroy method called
        will also cleanup the binding. Returns a reference to
        the newly created binding and also adds the binding to
        this object's bindings array.
    */
    binding: function (/* _binding definitions_ */) {
        var definitions = arguments;
        var idx = 0;
        var len = definitions.length;
        var binding;
        var properties = {};
        var bindings = this.bindings;
        var def = enyo.getPath(this.defaultBindingKind);
        var ctor;
        var kind;
        for (; idx < len; ++idx) enyo.mixin(properties, definitions[idx]);
        if ((kind = properties.kind)) {
            if ("string" === typeof kind) ctor = enyo.getPath(properties.kind);
            else if ("function" === typeof kind) ctor = kind;
        }
        if (!ctor || "function" !== typeof ctor) ctor = def;
        binding = new ctor({owner: this, autoConnect: true}, properties);
        bindings.push(binding);
        return binding;
    },
    //*@public
    /**
        Usually called when the object's destroy method is executed but can
        be called anytime to properly cleanup any bindings associated with
        this object (have their owner property set to this object). Does
        not remove bindings whose origin is from another object but are bound
        to a property of this object. Can be given an array of bindings instead
        and only those bindings will be destroyed.
    */
    clearBindings: function (subset) {
        var bindings = enyo.cloneArray(subset || this.bindings || []);
        var binding;
        while (bindings.length) {
            binding = bindings.shift();
            // this will force the binding to be removed from the real
            // bindings array of the object
            if (binding instanceof enyo.Binding) binding.destroy();
        }
    },
    //*@public
    /**
        This method will take an array of bindings or the bindings associated
        with this object and call their refresh method. In most scenarios this
        is not necessary and will automatically be called.
    */
    refreshBindings: function (subset) {
        var bindings = enyo.cloneArray(subset || this.bindings || []);
        var binding;
        while (bindings.length) {
            binding = bindings.shift();
            if (binding instanceof enyo.Binding) binding.refresh();
        }
    },
    //*@public
    /**
        Typically not called directly as this method is called by the binding
        when it is destroyed. Accepts a single binding as its parameter and
        removes the binding from its bindings array if it exists there. This
        does not destroy the binding or dereference its owner property.
    */
    removeBinding: function (binding) {
        // sanity check on binding
        if (!enyo.exists(binding) || !(binding instanceof enyo.Binding)) return;
        var bindings = this.bindings || [];
        var idx = bindings.indexOf(binding);
        if (!!~idx) bindings.splice(idx, 1);
    },
    //*@protected
    /**
        Used to find and setup any computed properties on this object
        during initialization. This method will not run if the initComputed
        property is set to false.
    */
    setupComputed: function (force) {
        if (false === this.initComputed && !force) return;
        // prevent this from being run again unless force is true
        this.initComputed = false;
        var prop;
        var key;
        var idx;
        var len;
        var dependents;
        var dependent;
        var fn;
        // find any previously setup computed properties or reset the
        // hash
        var computed = this.computed || (this.computed = {});
        for (key in this) {
            if (!enyo.exists((prop = this[key]))) continue;
            // we only care if it is a function since thats what a
            // computed property is
            if ("function" === typeof prop) {
                // and even then we only care if it is marked as a computed
                // property
                if (true === prop.isProperty) {
                    // keep a reference to the it on the hash
                    computed[key] = prop;
                    dependents = prop.properties || [];
                    for (idx = 0, len = dependents.length; idx < len; ++idx) {
                        dependent = dependents[idx];
                        // create the method that will respond
                        fn = enyo.bind(this, function (prop) {
                            this.notifyObservers(prop, null, this.get(prop), true);
                        }, key);
                        // add an observer for this dependent and have the listener
                        // trigger the notification for the parent property
                        this.addObserver(dependent, fn);
                    }
                }
            }
        }
    },
    //*@protected
    /**
        This method is responsible for initializing any observers on
        the object. Will not execute if the initObservers property is
        set to false. Observers cannot be added for the same event more
        than once.
    */
    setupObservers: function (force) {
        if (false === this.initObservers && !force) return;
        this.initObservers = false;
        this.didSetupObservers = true;
        var key;
        var prop;
        var idx;
        var len;
        // grab the observers hash or create a new one if this is
        // the first pass
        var observers = this.observers || (this.observers = {});
        var events;
        var event;
        for (key in this) {
            if (!enyo.exists((prop = this[key]))) continue;
            // we only really care if it is a function
            if ("function" === typeof (prop)) {
                // and even then we only really care if it is an observer
                if (true === prop.isObserver) {
                    events = prop.events || [];
                    if (!events.length) continue;
                    for (idx = 0, len = events.length; idx < len; ++idx) {
                        event = events[idx];
                        // wire up the real observer for this method
                        this.addObserver(event, prop, this);
                    }
                }
            }
        }
    },
    //*@public
    /**
        For any property on the object an observer can be added. Observers
        are registered via this method by passing in the property that should
        trigger the listener/observer and an optional context for the method
        to be executed under when it is triggered. Observers cannot be added
        for the same event more than once. Returns a reference to the function
        that was registered so it can be stored for later removal.
    */
    addObserver: function (property, fn, context) {
        var observers = this.observers || (this.observers = {});
        var handlers;
        // if a context is provided for the listener we bind it
        // to that context now
        fn = context? enyo.bind(context, fn): fn;
        // if there are no registered handlers for this event
        // go ahead and create an array for them
        if (!enyo.exists(observers[property])) handlers = observers[property] = [];
        else handlers = observers[property];
        // only add it if it isn't already in the array
        if (!~handlers.indexOf(fn)) handlers.push(fn);
        // allow chaining
        return fn;
    },
    //*@public
    /**
        Attempts to remove the given listener/observer for the given
        property if it exists. Typically not called directly. If no function is
        supplied it will remove all listeners for the given property.
    */
    removeObserver: function (property, fn) {
        var observers = this.observers;
        var idx;
        var handlers;
        if (!(handlers = observers[property])) return this;
        if (enyo.exists(fn) && "function" === typeof fn) {
            idx = handlers.indexOf(fn);
            if (!!~idx) {
                // remove it from the array
                handlers.splice(idx, 1);
            }
        } else {
            // we need to remove ALL the observers of this property
            delete observers[property];
        }
    },
    //*@public
    /**
        Convenience method to remove all observers on all properties.
        Returns reference to this object for chaining. This will almost
        never need to be called by anything but the destroy method. Returns
        a reference to this object for chaining.
    */
    removeAllObservers: function () {
        var observers = this.observers;
        var handlers;
        var observer;
        var binding;
        var prop;
        var idx;
        for (prop in observers) {
            if (!observers.hasOwnProperty(prop)) continue;
            handlers = observers[prop];
            // orphan the array so it will be cleaned up by the GC
            observers[prop] = null;
            for (idx = 0, len = handlers.length; idx < len; ++idx) {
                observer = handlers[idx];
                // check to see if the observer is associated with a binding
                // if it is we need to notify it that we are being destroyed
                // this is a proactive check - it has a failsafe if this
                // didn't take place
                if (observer.bindingId) {
                    binding = enyo.Binding.map[observer.bindingId];
                    if (binding && binding instanceof enyo.Binding) binding.destroy();
                }
            }
        }
        // reset our observers hash
        this.observers = {};
        return this;
    },
    //*@public
    /**
        Notifies any observers for a given property. Accepts the previous
        value, the current value. Looks for a backwards compatible function
        of the _propertyChanged_ form and will call that if it exists while
        also notifying other observers.
    */
    notifyObservers: function (property, prev, value) {
        var observers = this.observers || {};
        var handlers = (observers[property] || []);
        var idx = 0;
        var fn;
        var ch = enyo.uncap(property) + "Changed";
        if ("*" !== property) handlers = enyo.merge(handlers, observers["*"] || []);
        if (handlers) {
            for (; idx < handlers.length; ++idx) {
                fn = handlers[idx];
                if (!enyo.exists(fn) || "function" !== typeof fn) continue;
                if (false === this.allowNotifications) {
                    this.addNotificationToQueue(property, fn, [property, prev, value]);
                } else {
                    fn.call(this, property, prev, value);
                }
            }
        }
        
        if (enyo.exists(this[ch]) && "function" === typeof this[ch]) {
            if (false === this.allowNotifications) {
                this.addNotificationToQueue(property, this[ch], [prev, value]);
            } else {
                this[ch].call(this, prev, value);
            }
        }
    },
    //*@protected
    notificationQueue: null,
    //*@protected
    allowNotifications: true,
    //*@protected
    allowNotificationQueue: true,
    //*@protected
    /**
        This is used internally when a notification is queued.
    */
    addNotificationToQueue: function (property, fn, params) {
        var queue = this.notificationQueue || (this.notificationQueue = {});
        var handlers = queue[property];
        params = params || [];
        if (false === this.allowNotificationQueue) return;
        if (!enyo.exists(handlers)) {
            // create an entry for this property note that the queue for
            // every property uses the first array index as the parameters
            queue[property] = [params, fn];
        } else {
            // update the properties for this entry so if the value has
            // been updated before the queue is flushed it uses the most
            // recent values
            // TODO: replace me with something that will actually work!
            if (handlers[0] !== params) handlers.splice(0, 1, params);
            if (!~handlers.indexOf(fn)) handlers.push(fn);
        }
    },
    //*@public
    /**
        Call this method in order to keep all notifications on this object
        from firing. This does not clear/flush the queue. Any notifications
        fired during the time they are disabled will be added to the queue.
        The queue can be arbitrarily flushed or cleared when ready. If a
        boolean true is passed to this method it will disable the queue as
        well. Disabling the queue will immediately clear (not flush) it as well.
        Increments an internal counter that requires the _startNotifications_
        method to be called the same number of times before notifications will
        be enabled again. The queue, if any, cannot be flushed if the counter
        is not 0.
    */
    stopNotifications: function (disableQueue) {
        this.allowNotifications = false;
        this._stop_count += 1;
        if (true === disableQueue) {
            this.disableNotificationQueue();
        }
    },
    //*@protected
    _stop_count: 0,
    //*@public
    /**
        Call this method to enable notifications for this object and immediately
        flush the notification queue if the internal counter is 0. If notifications 
        were already enabled it will have no effect. Otherwise it will decrement the
        internal counter. If the counter becomes 0 it will allow notifications and
        attempt to flush the queue if there is one and it is enabled. This method
        must be called once for each time the _stopNotifications_ method was called.
        Passing a boolean true to this method will reenable the notification queue
        if it was disabled.
    */
    startNotifications: function (enableQueue) {
        if (0 !== this._stop_count) --this._stop_count;
        if (0 === this._stop_count) {
            this.allowNotifications = true;
            this.flushNotifications();
        }
        if (true === enableQueue) this.enableNotificationQueue();
    },
    //*@public
    /**
        Call this method to enable the notification queue. If it was already
        enabled it will have no effect. If notifications are currently enabled
        this will have no effect until they are disabled.
    */
    enableNotificationQueue: function () {
        this.allowNotificationQueue = true;
    },
    //*@public
    /**
        Call this method to disable the notification queue. If it was already
        disabled it will have no effect. If notifications are currently enabled
        this will have no effect. If they are disabled future notifications will
        not be queued and any in the queue will be cleared (not flushed).
    */
    disableNotificationQueue: function () {
        this.allowNotificationQueue = false;
        this.notificationQueue = {};
    },
    //*@protected
    /**
        This method is used internally to flush any notifications that have been
        queued.
    */
    flushNotifications: function () {
        if (0 !== this._stop_count) return;
        var queue = this.notificationQueue;
        var fn;
        var property;
        var handlers;
        var params;
        if (!enyo.exists(queue) || false === this.allowNotificationQueue) return;
        for (property in queue) {
            if (!queue.hasOwnProperty(property)) continue;
            handlers = queue[property];
            params = handlers.shift();
            // if an entry just so happens to be added improperly by someone
            // trying to bypass the default means by which to add something to
            // the queue...
            if ("function" === typeof params) {
                handlers.unshift(params);
                params = [];
            }
            while (handlers.length) {
                fn = handlers.shift();
                fn.apply(this, params);
            }
        }
    },
    //*@public
    /**
        Call this method with the name (or path) to the desired property or
        computed property. If it encounters a computed property it will return
        the value of that property and not the function. If it cannot find
        or resolve the requested path relative to the object it will return
        undefined.
        
        This method is backwards compatible and will automatically call any
        existing _getter_ method that uses the getProperty convention although
        this convention ought to be replaced using a computed property moving
        forward.
    */
    get: function (path) {
        return enyo.getPath.apply(this, arguments);
    },
    //*@public
    /**
        Call this method with a property (or path) and a value to be set. This
        will automatically notify any listeners/observers that the property has
        been changed if the values are not the same. If the property it finds
        is a computed property it will pass the intended value to the computed
        property (but will not return the value).
        
        This method is backwards compatible and will call any setter of the
        setProperty convention although these methods should be replaced with
        computed properties or observers where necessary.
    */
    set: function (path, value) {
        return enyo.setPath.apply(this, arguments);
    },
    //*@public
    /**
        This method is an instance method that extends an active instance
        of a kind and not the kind base. This can be passed an object or a string-
        path that can be resolved to an object or an _enyo.Mixin_. Non-function
        properties of the object will overwrite the current value on object. Functions
        will be bound to the current object. This method differs from _enyo.mixin_ in
        that _enyo.mixin_ will not overwrite methods nor can it handle _enyo.Mixin_
        objects. This method accepts a variable number of objects/_enyo.Mixins_ to be
        applied to this kind instance.
    */
    extend: function () {
        var args = enyo.toArray(arguments);
        var ext;
        var key;
        var prop;
        while (args.length && (ext = args.shift())) {
            if (ext.isMixin || "function" === typeof ext) {
                this.extendMixin(ext);
            } else {
                for (key in ext) {
                    if (!ext.hasOwnProperty(key)) continue;
                    prop = ext[key];
                    if ("string" === typeof prop) {
                        this[key] = prop;
                    } else if ("function" === typeof prop) {
                        this.extendMethod(key, prop, ext);
                    }
                }
            }
        }
    },
    //*@protected
    /**
        Used internally to properly extend methods.
    */
    extendMethod: function (property, fn, ext) {
        var base = this[property];
        var computed = !!fn.isProperty;
        var observer = !!fn.isObserver;
        var method;
        // proxy the method once so it will be applied to the
        // correct context (not the same as binding as enyo.bind)
        method = enyo.proxyMethod(fn, this);
        // if there wasn't already a method for this property than
        // create the inherited method as enyo.nop to avoid
        // unnecessary errors if _this.inherited_ is called
        if (!enyo.exists(base) || "function" !== typeof base) {
            base = enyo.nop;
        }
        // insert the newly proxied method onto our object and setup
        // the inheritance chain
        this[property] = method;
        method._inherited = base;
        // if it is a computed property make sure to copy the
        // dependencies to the proxied method
        if (true === computed) {
            method.isProperty = true;
            method.properties = fn.properties || [];
        } else if (true === observer) {
            method.isObserver = true;
            method.events = fn.events || [];
        }
        // mark it as a method that was extended
        method.isExtended = true;
    },
    //@protected
    /**
        Used internally to extend the instance of the kind by an _enyo.Mixin_.
    */
    extendMixin: function (mixin) {
        // this is a convenience method, mixins actually apply themselves
        if (enyo.exists(mixin) && mixin.apply) mixin.apply(this);
    },
    //*@protected
    destroy: function () {
        // destroy all bindings owned by this object
        this.clearBindings();
        // remove any observers that may still be attached
        this.removeAllObservers();
        // JS objects are never truly destroyed (GC'd) until all references are gone,
		// we might have some delayed action on this object that needs to have access
		// to this flag.
		this.destroyed = true;
    }
});

//* @protected

enyo._objectCount = 0;

enyo.Object.subclass = function(ctor, props) {
    this.publish(ctor, props);
};

enyo.Object.publish = function(ctor, props) {
    var pp = props.published;
    if (pp) {
        var cp = ctor.prototype;
        for (var n in pp) {
            // need to make sure that even though a property is "published"
            // it does not overwrite any computed properties
            if (props[n] && enyo.isFunction(props[n]) && props[n].isProperty) continue;
            enyo.Object.addGetterSetter(n, pp[n], cp);
        }
    }
};

//*@protected
/**
    This method creates a getter/setter for a published property of
    an _enyo.Object_ but is deprecated. It is maintained for backwards
    compatability purposes. The prefered method is to mark public and
    protected (private) methods and properties using documentation or
    other means and rely on the _get_ and _set_ methods of _enyo.Object_
    instances.
*/
enyo.Object.addGetterSetter = function (property, value, proto) {
    var getter = "get" + enyo.cap(property);
    var setter = "set" + enyo.cap(property);
    var fn;
    // set the initial value for the prototype
    proto[property] = value;
    fn = proto[getter];
    // if there isn't already a getter provided create one
    if ("function" !== typeof fn) {
        fn = proto[getter] = function () {return this.get(property)};
        fn.overloaded = false;
    } else if (false !== fn.overloaded) {
        // otherwise we need to mark it as having been overloaded
        // so the global getter knows not to ignore it
        fn.overloaded = true;
    }
    // if there isn't already a setter provided create one
    fn = proto[setter];
    if ("function" !== typeof fn) {
        fn = proto[setter] = function () {return this.set(property, arguments[0])};
        fn.overloaded = false;
    } else if (false !== fn.overloaded) {
        // otherwise we need to mark it as having been overloaded
        // so the global setter knows not to ignore it
        fn.overloaded = true;
    }
};
