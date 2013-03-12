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
        "enyo.ComputedSupport",
        "enyo.BindingSupport"
    ],

    constructor: function(props) {
        enyo._objectCount++;
        this.importProps(props);
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
