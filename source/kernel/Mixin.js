(function () {
    
    //*@protected
    var ignore = ["create"];
    
    //*@public
    /**
    */
    enyo.kind({
    
        // ...........................
        // PUBLIC PROPERTIES
        
        //*@public
        name: "enyo.Mixin",
        
        //*@public
        kind: null,
        
        // ...........................
        // PROTECTED PROPERTIES
    
        //*@protected
        _target: null,
    
        // ...........................
        // COMPUTED PROPERTIES
    
        //*@protected
        properties: enyo.Computed(function () {
            // the original keys stored by the kind creation feature
            var keys = enyo.clone(this.ctor.prototype._mixin_properties);
            // the return properties
            var props;
            // the property as we iterate over them
            var prop;
            // the key as we check for functions
            var key;
            // grab just those properties
            props = enyo.only(keys, this);
            for (key in props) {
                prop = props[key];
                if ("function" === typeof prop) {
                    prop.nom = this.kindName + "." + key + "()";
                }
            }
            return props;
        }),
    
        // ...........................
        // PUBLIC METHODS
    
        //*@public
        /**
            This is the mixin's create method, ___it does not override
            the target kind's___. This will be called during the kind's
            own initialization routine as directed by its _create_ method.
            Put setup/initialization routine functionality for this mixin
            in the method. There will be no _inherited_ method to call.
        */
        create: function () {
            return;
        },
    
        //*@public
        /**
            This destroy method ___will be injected in the chain of destructors
            for the target kind___. Any additional cleanup needed by this
            mixin should be executed here. Ensure you call _this.inherited_ to
            continue the chain of destructors.
        */
        destroy: function () {
            return this.inherited(arguments);
        },
    
        // ...........................
        // PROTECTED METHODS
        
        //*@protected
        /**
            This is protected because it should never be accessible
            or used externally by the nature of how mixins function.
        */
        get: function () {
            return enyo.getPath.apply(this, arguments);
        },
        
        //*@protected
        apply: function () {
            var target = this._target;
            var applied = target.appliedMixins || (target.appliedMixins = []);
            var props = this.get("properties");
            var base;
            var fn;
            // we won't allow the same mixin to be applied more than once
            if (!!~applied.indexOf(this.kindName)) return;
            // go ahead and add our name to the list
            applied.push(this.kindName);
            // all enyo objects know how to extend themselves with hashes
            target.extend(props);
            // if the target has already setup their observers force them
            // to reevaluate them again in case we have any that need to
            // be initialized
            if (target.didSetupObservers) {
                target.setupObservers(true);
            }
            // we need to inject our destructor
            base = target.destroy;
            fn = target.destroy = enyo.proxyMethod(this.destroy, target);
            fn._inherit = base;
            // if for some reason binding initialization has been postponed
            // we need to wait for them to have been setup before we call
            // our create method
            if (true !== target.didSetupBindings) {
                fn = enyo.proxyMethod(this.create, target);
                target.addObserver("didSetupBindings", fn);
            } else this.create.call(target);
        },
        
        //*@protected
        constructor: function (props) {
            var props = props || {};
            this._target = props.target;
        },
        
        //*@protected
        constructed: function () {
            this.apply();
        },
        
        //*@protected
        applied: function () {
            this._target = null;
        }
    
        // ...........................
        // OBSERVERS
    
    });
 
  
    //*@protected
    /**
        We add a kind/feature hook to store the original properties used
        when defining the mixin in question.
    */
    enyo.kind.features.push(function (ctor, props) {
        var base = ctor.prototype.base;
        var supr = ctor.prototype.ctor;
        if (base === enyo.Mixin || supr === enyo.Mixin || ctor.prototype instanceof enyo.Mixin) {
            ctor.prototype._mixin_properties = enyo.keys(enyo.except(ignore, props));
        }
    });
    
 
}());