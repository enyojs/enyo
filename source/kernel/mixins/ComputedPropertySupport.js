(function () {
    
    //*@public
    /**
        The possible/configurable options that can be passed in
        one or more hashes to the computed method when wrapping a
        function as a computed property of an object.
    */
    var defaults = {
        
        //*@public
        /**
            If a computed property is marked as volatile it will
            be executed on every request regardless of its dependencies.
            If both _volatile_ and _cached_ are set to true it will
            default to _cached_ and ignore _volatile_.
        */
        volatile: true,
        
        //*@public
        /**
            If a computed property is marked as being cached, its
            value will be computed once and reused unless one of its
            dependencies has been flagged as being changed prior to
            the request. If there are no dependencies it will only
            ever execute once. If this setting is true it overrides
            the _volatile_ configuration value.
        */
        cached: false,
        
        //*@public
        /**
            Most cacheable computed properties will not need to be
            evaluated until the first time they are requested, however,
            they can be evaluated immediately after instancing the
            class if this flag is set to false.
        */
        defer: true,
        
        //*@protected
        value: null,
        
        //*@protected
        dirty: 0
    };
    
    //*@public
    /**
        Wrapping a class method in _enyo.computed_ or _enyo.Computed_ will
        allow that method to be interpreted as a static property and is bindable
        by _enyo.Binding_s. Computed properties accept a configuration hash as
        an optional parameter to the _enyo.Computed_ call and any number of string
        parameters that will be evaluated as dependencies of the property. Notifications
        of changes to any of those properties will flag the computed property as
        needing to be reevaluated the next time it is requested (if it is cached).
        Computed properties are _volatile_ by default and will be evaluated on each
        request unless marked otherwise.
    */
    var computed = enyo.Computed = enyo.computed = function (fn /*, arguments */) {
        var deps = enyo.toArray(arguments).slice(1);
        var config;
        var properties;
        if (!enyo.exists(fn) || "function" !== typeof fn) {
            throw "enyo.Computed: a computed property must be a function";
        }
        properties = fn.properties || (fn.properties = []);
        config = fn.config || enyo.clone(defaults);
        enyo.forEach(deps, function (dep) {
            if ("string" === typeof dep) properties.push(dep);
            else if ("object" === typeof dep) {
                // the assumption here is it must be a configuration
                // hash
                enyo.mixin(config, dep);
            }
        });
        if (false === config.volatile) config.cached = true;
        else if (true === config.cached) config.volatile = false;
        fn.config = config;
        fn.isProperty = true;
        config.properties = properties;
        return fn;
    };
    
    //*@protected
    var _is_computed = function (fn) {
        return fn && "function" === typeof fn && true === fn.isProperty;
    };
    
    //*@protected
    var _add_dependent = function (proto, property, dependent) {
        var $map = proto._computed_map;
        if (!$map[dependent]) $map[dependent] = [];
        $map[dependent].push(property);
    };
    
    //*@protected
    var _add_cacheable = function (proto, property) {
        var $cacheable = proto._computed_cacheable;
        $cacheable.push(property);
    };
    
    //*@protected
    /**
        Simply adds an entry into the computed properties hash of
        the object so that it can easily be referenced later. Also add
        an entry for the property name of the computed property for
        each of its dependent properties so when they are mapped they
        can trigger the appropriate update.
    */
    var _add_computed = function (proto, property, fn) {
        var $computed = proto._computed;
        // TODO: this is assuming the desirable end is to override
        // any previous entry for a newer entry of the same property
        // name
        var $config = $computed[property] = fn.config;
        // if the property is configured as cacheable and not deferred
        // we add it to a special object to speed up initialization
        if ($config.cached && !$config.defer) _add_cacheable(proto, property);
        // for every dependency we need to add it to the object
        enyo.forEach(fn.properties, function (dep) {_add_dependent(proto, property, dep)});
    };
    
    //*@protected
    var _find_computed = function (proto, props, kind) {
        // no need to bother if this does not support computed properties
        if (!proto._supports_computed) return;
        // otherwise we know it does and we need to make sure it has some
        // intial storage properties
        proto._computed = kind? enyo.clone(proto._computed || {}): proto._computed || {};
        proto._computed_map = kind? enyo.clone(proto._computed_map || {}) : proto._computed_map || {};
        proto._computed_cacheable = kind? enyo.clone(proto._computed_cacheable || []): proto._computed_cacheable || [];
        // now we iterate over only the properties defined on this new
        // kind definition (or ones being added by a mixin) and check to
        // see if they are computed properties so we only have to do this
        // once and not at instance initialization time
        for (var prop in props) {
            if (props[prop] && _is_computed(props[prop])) {
                _add_computed(proto, prop, props[prop]);
            }
        }
    };
    
    //*@protected
    /**
        Called by the overloaded getter for objects using the mixin support
        feature - is called under the context of the object.
    */
    var _get_computed = function (path) {
        // we grab the current configuration for the computed property
        var $config = this._computed[path];
        // and a reference to the method in case we need it
        var fn = this[path];
        // the fast track is for computed properties that are volatile
        // and do not cache we simply execute them and return the value
        if (true === $config.volatile) {
            return fn.call(this);
        } else if (true === $config.cached) {
            if ($config.dirty || $config.defer) {
                $config.dirty = 0;
                $config.value = fn.call(this);
                $config.defer = null;
                return $config.value;
            } else return $config.value;
        }
    };
    
    //*@protected
    /**
        We pass the requested value into the computed property which
        may/may-not handle the value.
    */
    var _set_computed = function (path, value) {
        // and a reference to the method because we will need it
        var fn = this[path];
        // we merely execute the computed property and pass it the
        // value, if it was capable of setting the value it will
        // handle it otherwise it will recompute
        fn.call(this, value);
        // mark it as dirty and push it to the queue
        _update_computed.call(this, path);
        // flush the queue immediately
        _flush_queue.call(this);
    };
    
    //*@protected
    var _update_computed = function (prop) {
        var $computed = this._computed;
        var $config = $computed[prop];
        if ($config) {
            // TODO: while not every computed property is cached
            // we have to check for it anyways and rather than
            // cause greater overhead to test whether or not it
            // is cachable and needs updating just do this as it
            // should be harmless otherwise
            ++$config.dirty;
            this._computed_queue.push(prop);
        }
    };
    
    //*@protected
    var _flush_queue = function () {
        var $queue = this._computed_queue;
        if (!$queue.length) return;
        do {
            this.notifyObservers($queue.shift());
        } while ($queue.length);
    };
    
    //*@protected
    /**
        This method is called on every object, we simply detect if the
        object supports computed properties and if it does we execute
        any cacheables that don't have _defer_ set to true.
    */
    var _post_constructor = function () {
        if (!this._supports_computed) return;
        // look for the special property created by the feature hook
        // for any cacheable non-deferred computed properties if
        // the kind even supports computed properties
        var $computed = this._computed_cacheable;
        var prop;
        var idx;
        // for each property that needs updating we arbitrarily flag
        // it as dirty and force it to be evaluated and cached
        for (idx = 0, len = $computed.length; idx < len; ++idx) {
            prop = $computed[idx];
            // mark it as dirty so it will actually be executed
            _update_computed.call(this, prop);
            // evaluate the cacheable method
            _get_computed.call(this, prop);
        }
    };
    
    //*@protected
    /**
        Strictly used internally as the assumption is the structure of
        these protected properties will be safe and this method is
        not exposed...it should only ever be executed pre computation of
        any cacheable values.
    */
    var _computed_clone = function ($computed, recursing) {
        var copy = {};
        var prop;
        for (prop in $computed) {
            if (!$computed.hasOwnProperty(prop)) continue;
            if ("object" === typeof $computed[prop]
                && null !== $computed[prop]
                && !recursing) copy[prop] = _computed_clone($computed[prop], true);
            else copy[prop] = $computed[prop];
        }
        return copy;
    };
    
    //*@protected
    /**
        Hook the kind features to automate handling of computing when
        the kind is created.
    */
    enyo.kind.features.push(function (ctor, props) {_find_computed(ctor.prototype, props, true)});
    
    //*@protected
    /**
        Hook the kind post-initialize routines to make sure we can
        setup our cached computed properties that need it.
    */
    enyo.kind.postConstructors.push(_post_constructor);
    
    //*@protected
    /**
        Add a special handler for mixins to be aware of computed properties.
    */
    enyo.mixins.features.push(_find_computed);
    
    //*@protected
    enyo.createMixin({
        
        // ...........................
        // PUBLIC PROPERTIES
        
        //*@public
        name: "enyo.ComputedSupport",
    
        // ...........................
        // PROTECTED PROPERTIES
        
        //*@protected
        _supports_computed: true,
        
        // ...........................
        // COMPUTED PROPERTIES
    
        // ...........................
        // PUBLIC METHODS
        
        //*@public
        /**
            We overload the getter so that it can retrieve computed
            property values properly.
        */
        get: function (path) {
            if (_is_computed(this[path])) {
                return _get_computed.call(this, path);
            } else return this.inherited(arguments);
        },
        
        //*@public
        /**
            We overload the setter so that it can attempt to call
            the computed property with the values if it supports
            accepting parameters otherwise it may do nothing.
        */
        set: function (path, value) {
            if (_is_computed(this[path])) {
                return _set_computed.call(this, path, value);
            } else return this.inherited(arguments);
        },
        
        //*@public
        /**
            We overload the observer support method to hook when
            notifications are being sent to handle them the way we
            need to for computed properties.
        */
        notifyObservers: function (prop, prev, value) {
            // any of the possible notifications we want to map
            // to computed property (by name)
            var $map = this._computed_map;
            var len;
            var idx;
            if ($map[prop]) {
                len = $map[prop].length;
                idx = 0;
                // iterate over each of the dependent properties
                // and mark them as dirty note that the update method
                // will queue the property to notify its own listeners
                // of its state change
                for (; idx < len; ++idx) {
                    _update_computed.call(this, $map[prop][idx]);
                }
            }
            this.inherited(arguments);
            // if there was anything queued lets flush it now
            _flush_queue.call(this);
        },
    
        // ...........................
        // PROTECTED METHODS

        //*@protected
        _constructor: function () {
            // we need to make sure that we have unique property hashes
            // for each computed property (something we cannot do when
            // applying them to prototypes)
            this._computed = _computed_clone(this._computed);
            this._computed_queue = [];
            return this.inherited(arguments);
        },
        
        //*@protected
        destroy: function () {
            var $computed = this._computed;
            var $config;
            var prop;
            for (prop in $computed) {
                $config = $computed[prop];
                // make sure to fully release any reference this
                // might be holding onto
                delete $config.value;
                // release the entire object when we're done
                delete $computed[prop];
            }
        }
    
        // ...........................
        // OBSERVERS
        
    });

}());
