(function () {
    
    //*@public
    /**
        A computed property is an object-method that is treated as
        if it was a static property. It is assumed to be accessed
        (and in some cases set) via the object's _get_ and _set_
        methods - __not directly__. Computed properties serve several
        purposes but are primarily used in combination with _bindings_
        and _observers_. By default, computed properties re-execute their
        logic each time they are accessed (considered volatile). Since
        computed properties can have dependencies (other properties they
        observe for changes thus indicating any listeners that they have
        also changed), if set to be cacheable will only be re-evaluated
        if one of their dependents has triggered an update.
        
        Available configuration options:
            
            volatile - boolean, defaults to true, computed property will
                be recomputed each time it is accessed, automatically set
                to false if the _cached_ flag is set to true
            
            cached - boolean, defaults to false, if true the computed property
                will evaluate once each time any dependent triggers an update, if
                there are no dependents this computed property will only ever
                be evaluated once unless an arbitrary call is made to update it
                
            defer - boolean, defaults to true and only matters if _cached_ is
                set to true, will defer an initial evaluation (default behavior
                for cached computed properties) until the first time it is requested
                otherwise it will execute the evaluation during initialization
                of the object
            
    */
    
    //*@protected
    var defaults = {
        volatile: true,
        cached: false,
        updated: null,
        value: null,
        owner: null,
        properties: null,
        dirty: false,
        defer: true
    };
    
    //*@protected
    var _keys = ["isProperty", "config", "property", "nom"];
    
    //*@public
    /**
    */
    var computed = enyo.Computed = enyo.computed = function (fn /*, arguments */) {
        var deps = enyo.toArray(arguments).slice(1);
        var config;
        var properties;
        if (!enyo.exists(fn) || "function" !== typeof fn) {
            throw "enyo.Computed: a computed property must be a function";
        }
        properties = fn.properties || [];
        config = fn.config || enyo.clone(defaults);
        enyo.forEach(deps, function (dep) {
            if ("string" === typeof dep) properties.push(dep);
            else if ("object" === typeof dep) {
                // the assumption here is it must be a configuration
                // hash
                enyo.mixin(config, dep);
            }
        });
        config.properties = properties;
        if (false === config.volatile) config.cached = true;
        else if (true === config.cached) config.volatile = false;
        fn.config = config;
        fn.isProperty = true;
        return fn;
    };
    
    //*@protected
    var evaluate = function (config, args) {
        var owner = config.owner;
        var prev = config.value;
        var props = owner.computed;
        var key = config.property;
        var method = props[key];
        config.value = method.apply(owner, args);
        config.last = prev;
        config.updated = enyo.bench();
        config.dirty = false;
        return config.value;
    };
    
    //@protected
    var destroy = computed.destroy = function (config) {
        var owner = config.owner || {};
        var props = owner.computed;
        var cache = props["_cache_"];
        var name = config.property;
        enyo.forEach(_keys, function (key) {delete config[key]});
        delete props[name];
        delete cache[name];
    };
    
    //*@protected
    var update = computed.update = function (config, args) {
        var updated = config.updated;
        var dirty = config.dirty;
        if (!updated || (dirty && dirty > updated) || (true === config.volatile)) {
            return evaluate(config, args);
        } else {
            console.log("using cached value: " + config.computedName);
            return config.value;
        }
    };
    
    //*@protected
    enyo.computed.keys = _keys;
    
}());
