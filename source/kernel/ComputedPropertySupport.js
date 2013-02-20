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
            
    */
    
    //*@protected
    var defaults = {
        isProperty: true,
        volatile: true,
        cached: false,
        updated: null,
        value: null,
        owner: null,
        update: null,
        destroy: null,
        properties: null,
        dirty: false
    };
    
    //*@protected
    var _keys = enyo.keys(defaults);
    
    //*@protected
    var evaluate = function (comp, args) {
        var owner = comp.owner || enyo.global;
        var last = comp.value;
        var value = comp.apply(owner, args);
        comp.value = value;
        comp.last = last;
        comp.updated = enyo.bench();
        comp.dirty = false;
        return value;
    };
    
    //@protected
    var destroy = function (comp, name) {
        var owner = comp.owner || {};
        var props = owner.computed;
        enyo.forEach(_keys, function (key) {delete comp[key]});
        delete props[name];
    };
    
    //*@protected
    var update = function (comp, args) {
        var updated = comp.updated;
        var dirty = comp.dirty;
        if (!updated || (dirty && dirty > updated) || (true === comp.volatile)) {
            if (dirty) console.log("evaluating dirty computed property: " + comp.computedName);
            else if (!updated) console.log("evaluating previously un-executed computed property: " + comp.computedName);
            else if (true === comp.volatile) console.log("evaluating volatile computed property: " + comp.computedName);
            return evaluate(comp, args);
        } else {
            console.log("using cached value: " + comp.computedName);
            return comp.value;
        }
    };
    
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
        config.update = function (args) {return update(this, args)};
        config.destroy = function (name) {destroy(this, name)};
        config.properties = properties;
        config.evaluate = function (args) {return evaluate(this, args)};
        if (false === config.volatile) config.cached = true;
        else if (true === config.cached) config.volatile = false;
        enyo.mixin(fn, config);
        return fn;
    };
    
    //*@protected
    enyo.computed.keys = _keys;
    
}());
