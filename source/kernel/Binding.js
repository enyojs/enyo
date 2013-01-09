(function () {
    
    //*@public
    /**
        The _enyo.Binding_ object is designed to connect and synchronize
        the state between two properties of _enyo.Object_s. It can function
        as a two-way or one-way binding (where a only changes from the source
        are propagated to the target and not vice versa). While the object
        can be used and implemented on its own, _enyo.Object_s and any subkinds
        are able to use them through an automated API.
        
        TODO: complete intro documentation
    */
    enyo.Binding = Binding;
    
    //*@protected
    enyo.Transform = Transform;
    
    //*@protected
    function Transform (fn, binding) {
        this.transformer = fn;
        this.binding = binding;
    }
    
    //*@protected
    Transform.prototype = {
        stop: function () {
            throw "stop";
        },
        transform: function (value, direction) {
            var fn = this.transformer;
            var binding = this.binding;
            var context = binding.owner || enyo.global;
            return fn.call(context, value, direction, binding);
        },
        destroy: function () {
            this.transformer = null;
            this.binding = null;
        }
    };
    
    //*@protected
    /**
        The constructor for a binding takes a variable number of parameters
        that are object/hashes with properties to be set on the binding. When
        multiple option-sets are provided and there are common properties the
        last property encountered will have its value used.
    */
    function Binding (/* arguments */) {
        var idx = 0;
        var len = arguments.length;
        // increment our binding counter for debugging purposes
        enyo.Binding.bindingCount++;
        // take any properties that were passed in and apply them
        // to this binding instance
        for (; idx < len; ++idx) enyo.mixin(this, arguments[idx]);
        // generate a new id for this binding
        this.bindingId = enyo.uid("binding");
        // run our initialization routines
        this.setup();
    }
    
    //*@public
    /**
        Keeps track of the number of bindings that are active at runtime.
        Mostly for debugging purposes.
    */
    enyo.Binding.bindingCount = 0;
    
    //*@protected
    /**
        Used internally as part of the getParts method.
    */
    var fromRoot = function (root, parts) {
        // check to see if the part of the path is relative to the root
        var piece = root[(parts || [])[0]];
        // if the root here is enyo.global then we need to ensure that
        // the piece is actually an object
        // this is very, very important
        if (enyo.exists(piece)) {
            if (enyo.global === root) {
                return "object" === typeof piece? root: undefined;
            } else return root;
        }
    };
    
    //*@protected
    /**
        Used internally to determine from the given information what the
        source and target paths and properties are. There is one exception case
        between determining parts for the source and the target in bindings so
        the optional third parameter helps it to use the correct algorithm.
    */
    var getParts = enyo.Binding.getParts = function (path, context) {
        var parts;
        var idx = 0;
        var ret = {};
        var root;
        var cur;
        var prop;
        var base;
        var part;
        var owner = this.owner;
        var local = path[0] === "."? true: false;
        path = path[0] === "."? path.slice(1): path;
        parts = path.split(".");
        root = local? context || owner: context || fromRoot(enyo.global, parts) || owner;
        base = root;
        ret.property = prop = parts.length > 1? parts.pop(): path;
        if (prop === path) {
            ret.base = base;
        } else {
            cur = base;
            for (; idx < parts.length; ++idx) {
                part = parts[idx];
                if (!part) continue;
                cur = cur[part];
                if (!cur || "string" === typeof cur) {
                    if (part !== prop) {
                        ret.base = null;
                    }
                    return ret;
                }
            }
            if (part !== path) base = cur;
            ret.base = base;
        }
        return ret;
    };
    
    //*@protected
    enyo.Binding.transform = function (value, direction) {
        var transform = this.transform;
        return transform(value, direction);
    };
    
    //*@protected
    /**
        The prototype of the _enyo.Binding_ object.
    */
    Binding.prototype = {
        //*@public
        source: null,
        //*@public
        target: null,
        //*@protected
        sourceProperty: null,
        //*@protected
        targetProperty: null,
        //*@protected
        sourceResponder: null,
        //*@protected
        targetResponder: null,
        //*@protected
        isConnected: false,
        //*@protected
        isRefreshing: false,
        //*@protected
        sourceConnected: false,
        //*@protected
        targetConnected: false,
        //*@public
        to: null,
        //*@public
        from: null,
        //*@public
        owner: null,
        //*@public
        autoConnect: true,
        //*@public
        autoSync: true,
        //*@public
        transform: null,
        //*@protected
        oneWay: true,
        //*@protected
        /**
            Initially called during construction to setup the properties
            of the binding appropriately exiting on specific conditions
            silently if the target or source could not be properly
            determined or found.
        */
        setup: function () {
            var connect = this.autoConnect;
            var sync = this.autoSync;
            var source = this.setupSource();
            var target = this.setupTarget();
            var refreshing = this.isRefreshing;
            // setup the transform if we can
            this.setupTransform();
            // if we are refreshing and cannot find
            // one of these parts we need to reset the targets
            // value if possible (happens frequently in proxy/model-
            // controllers who's model has been set to null)
            if (!(source && target)) {
                if (refreshing) {
                    if (target) {
                        // set the target's value to null to let
                        // it know we can't sync the real value from
                        // the source
                        this.setTargetValue(null);
                    }
                } else return;
            }
            // this will fail silently if setup went aury for
            // either the target or source
            if (connect || refreshing) this.connect();
            if (sync || refreshing) this.sync();
        },
        //*@protected
        sync: function () {
            if (true === this.isConnected) {
                this.syncFromSource();
            }
        },
        //*@protected
        refresh: function () {
            this.isRefreshing = true;
            // TODO: this needs to be reevaluated because refreshing
            // a binding as of now does more work than it should be
            this.disconnect();
            this.setup();
            this.isRefreshing = false;
        },
        //*@public
        /**
            Call this method to connect this binding to its
            source (and target). This only registers the responders
            but does not automatically synchronize the values.
        */
        connect: function () {
            if (true === this.isConnected) return;
            this.connectSource();
            this.connectTarget();
            if (this.sourceConnected && this.targetConnected) {
                this.isConnected = true;
            } else this.isConnected = false;
        },
        //*@public
        /**
            Call this method to disconnect this binding from
            its source (and target).
        */
        disconnect: function () {
            if (false === this.isConnected) return;
            this.disconnectSource();
            this.disconnectTarget();
            this.isConnected = false;
        },
        //*@protected
        setupSource: function () {
            var parts;
            var base;
            var property = this.sourceProperty;
            var source = this.source;
            var from = this.from;
            parts = getParts.call(this, from, source);
            base = parts.base;
            property = parts.property;
            if (!base || "object" !== typeof base) {
                return false;
            }
            this.source = base;
            this.sourceProperty = property;
            return true;
        },
        //*@protected
        setupTarget: function () {
            var parts;
            var base;
            var property = this.targetProperty;
            var target = this.target;
            var to = this.to;
            parts = getParts.call(this, to, target);
            base = parts.base;
            property = parts.property;
            if (!base || "object" !== typeof base) {
                return false;
            }
            this.target = base;
            this.targetProperty = property;
            return true;
        },
        //*@protected
        stop: function () {
            throw "stop-binding";
        },
        //*@protected
        connectSource: function () {
            var source = this.source;
            var property = this.sourceProperty;
            var fn = this.sourceResponder;
            if (!(source instanceof enyo.Object)) return (this.sourceConnected = false);
            // only create the responder if it doesn't already exist
            if (!enyo.exists(fn) || "function" !== typeof fn) {
                fn = enyo.bind(this, this.syncFromSource);
                this.sourceResponder = fn;
            }
            // if it is already connected don't do anything
            if (true === this.sourceConnected) return true;
            if (!enyo.exists(source)) return (this.sourceConnected = false);
            // assign the binding's id to the responder for debugging
            fn.bindingId = this.bindingId;
            // add the observer for the property on the source object
            source.addObserver(property, fn);
            return (this.sourceConnected = true);
        },
        //*@protected
        connectTarget: function () {
            var target = this.target;
            var property = this.targetProperty;
            var fn = this.targetResponder;
            var oneWay = this.oneWay;
            if (!(target instanceof enyo.Object)) return (this.targetConnected = false);
            // if this is a one way binding there is nothing to do
            if (true === oneWay) return (this.targetConnected = true);
            // only create the responder if it doesn't already exist
            if (!enyo.exists(fn) || "function" !== typeof fn) {
                fn = enyo.bind(this, this.syncFromTarget);
                this.targetResponder = fn;
            }
            // if it is already connected don't do anything else
            if (true === this.targetConnected) return true;
            if (!enyo.exists(target)) return (this.targetConnected = false);
            fn.bindingId = this.bindingId;
            target.addObserver(property, fn);
            return (this.targetConnected = true);
        },
        //*@protected
        syncFromSource: function () {
            var twoWay = !this.oneWay;
            var value = this.getSourceValue();
            var transformer = this.transform;
            // if this is a two way binding we need to
            // disconnect from the target first to ensure
            // we don't catch the update response
            // TODO: rethink this approach as try/catch are
            // costly in general...
            try {
                value = transformer.transform(value, "source");
            } catch (err) { 
                // the transform was interrupted, do not complete
                if ("stop-binding" === err) return;
                else throw err;
            }
            if (twoWay) this.disconnectTarget();
            this.setTargetValue(value);
            if (twoWay) this.connectTarget();
        },
        //*@protected
        syncFromTarget: function () {
            var value = this.getTargetValue();
            var transformer = this.transform;
            // TODO: same as for syncFromSource
            try {
                value = transformer.transform(value, "target");
            } catch (err) {
                // the transform was interrupted, do not complete
                if ("stop-binding" === err) return;
                else throw err;
            }
            this.disconnectSource();
            this.setSourceValue(value);
            this.connectSource();
        },
        //*@protected
        disconnectSource: function () {
            var source = this.source;
            var property = this.sourceProperty;
            var fn = this.sourceResponder;
            if (!enyo.exists(source)) return;
            source.removeObserver(property, fn);
            this.sourceConnected = false;
        },
        //*@protected
        disconnectTarget: function () {
            var target = this.target;
            var fn = this.targetResponder;
            var property = this.targetProperty;
            if (!enyo.exists(target)) return;
            if ("function" === typeof fn) target.removeObserver(property, fn);
            this.targetConnected = false;
        },
        //*@protected
        setSourceValue: function (value) {
            var source = this.source;
            var property = this.sourceProperty;
            source.set(property, value);
        },
        //*@protected
        setTargetValue: function (value) {
            var target = this.target;
            var property = this.targetProperty;
            target.set(property, value);
        },
        //*@protected
        getSourceValue: function () {
            var source = this.source;
            var property = this.sourceProperty;
            return source.get(property);
        },
        //*@protected
        getTargetValue: function () {
            var target = this.target;
            var property = this.targetProperty;
            return target.get(property);
        },
        //*@protected
        setupTransform: function () {
            var transform = this.transform;
            var owner = this.owner || {};
            // if it is a string we try and locate it on the owner
            // or as a global method
            if ("string" === typeof transform) {
                transform = owner[transform] || enyo.getPath(transform);
            } else if ("function" === typeof transform) {
                transform = this.transform;
            }
            // if we couldn't find anything go ahead and setup a default
            // to simply return the value
            if ("function" !== typeof transform) {
                transform = this.transform = function(value) {return value};
            }
            if (!(transform instanceof Transform)) {
                this.transform = new Transform(transform, this);
            }
        },
        //*@public
        /**
            Call this method to prepare this object to be
            cleaned up by the garbage collector.
        */
        destroy: function () {
            this.disconnect();
            this.source = null;
            this.target = null;
            this.sourceResponder = null;
            this.targetResponder = null;
            this.isDestroyed = true;
            enyo.Binding.bindingCount--;
            if (this.transform) {
                this.transform.destroy();
                this.transform = null;
            }
            if (this.owner) this.owner.removeBinding(this);
        }
    };
    
}());