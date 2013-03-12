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
    mixins: [
        "enyo.MixinSupport",
        "enyo.ObserverSupport",
        "enyo.ComputedSupport"
    ],
    //*@public
    /**
        Set this flag to false to delay or keep this portion
        of the object setup from executing.
    */
    initBindings: true,
    //*@public
    // the bindings for the object
    bindings: null,
    //*@public
    // The deafult binding kind to use unless overridden by
    // an individual binding definition
    defaultBindingKind: "enyo.Binding",
    constructor: function(props) {
        enyo._objectCount++;
        this.importProps(props);
    },
    //*@protected
    constructed: function (props) {
        this.setup();
    },
    
    importProps: function (props) {
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
        This method is responsible for calling each of the startup
        routines in order. This includes bindings, observers, and computed-
        properties.
    */
    setup: function () {
        this.setupHooks();
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
        // first grab the bindings block/array for the kind
        // remap those definitions to a different variable
        var kindBindings = this.bindings || [];
        var idx = 0;
        var len;
        var def;
        if (true === this._did_setup_bindings) {
            // this isn't the first time we've been here so we need
            // to refresh the bindings
            this.refreshBindings();
        } else {
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
            this._did_setup_bindings = true;
        }
        // if there are any listeners for this event notify them
        this.notifyObservers("_did_setup_bindings");
        // cleanup by removing all listeners on this event note that
        // not passing the function/handler makes it remove any/all
        // for that property!
        //this.removeObserver("_did_setup_bindings");
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
        
        if (!this.bindings) {
            enyo.warn(this.kindName + ".binding: instance binding requested but " +
                "initialization not completed");
        }
        
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
    
    //*@protected
    _binding_constructor: enyo.Computed(function () {
        return enyo.getPath(this.defaultBindingKind);
    }, {cached: true, defer: false}),
    
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
    _get_hooks: null,
    //*@protected
    _set_hooks: null,
    //*@protected
    _did_setup_hooks: false,
    //*@protected
    setupHooks: function () {
        if (true === this._did_setup_hooks) return;
        this._get_hooks = [];
        this._set_hooks = [];
        this._did_setup_hooks = true;
    },
    //*@public
    hook: function (which, how, what) {
        var hooks = this["_"+which+"_hooks"];
        hooks.push({path: how, method: what});
    },
    
    //*@protected
    _check_hooks: function (which, path, value) {
        if (!this._did_setup_hooks) return false;
        var hooks = this["_"+which+"_hooks"];
        var idx = 0;
        var len = hooks.length;
        var hook;
        for (; idx < len; ++idx) {
            hook = hooks[idx];
            if ("string" === typeof hook.path) {
                if (path === hook.path) {
                    return hook.method.call(this, path, value);
                }
            } else if ("function" === typeof hook.path) {
                if (true === hook.path(path)) {
                    return hook.method.call(this, path, value);
                }
            } else if (hook.path instanceof RegExp) {
                if (hook.path.test(path)) {
                    return hook.method.call(this, path, value);
                }
            }
        }
        return false;
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

    //*@protected
    destroy: function () {
        // destroy all bindings owned by this object
        this.clearBindings();
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
