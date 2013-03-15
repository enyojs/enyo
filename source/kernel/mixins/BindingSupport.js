(function (enyo) {

    //*@public
    /**
        This mixin adds core support for bindings, bindings-arrays and a
        binding API to objects that implement it. Requires computed property
        support and observer method support mixins.
    */
    enyo.createMixin({
    
        // ...........................
        // PUBLIC PROPERTIES
    
        //*@public
        name: "enyo.BindingSupport",
    
        //*@public
        /**
            While binding-kind can be overloaded on a per-binding basis
            for objects that intend to use a custom kind for all of its
            bindings it may be set here instead.
        */
        defaultBindingKind: "enyo.Binding",
    
        //*@public
        /**
            An array of declared configurations for bindings that
            will be created on object instantiation.
        */
        bindings: null,
    
        // ...........................
        // PROTECTED PROPERTIES
        
        //*@protected
        _supports_bindings: true,
    
        // ...........................
        // COMPUTED PROPERTIES
    
        //*@protected
        _binding_constructor: enyo.Computed(function () {
            return enyo.getPath(this.defaultBindingKind);
        }, {cached: true}),
    
        // ...........................
        // PUBLIC METHODS
    
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
            var def = this.get("_binding_constructor");
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
            var $bindings = subset || this.bindings;
            if (!$bindings.length) return;
            do {
                $bindings.shift().destroy();
            } while ($bindings.length);
        },
        
        //*@public
        /**
            This method will take an array of bindings or the bindings associated
            with this object and call their refresh method. In most scenarios this
            is not necessary and will automatically be called.
        */
        refreshBindings: function (subset) {
            var $bindings = subset || this.bindings;
            var len = $bindings.length;
            var idx = 0;
            for (; idx < len; ++idx) {
                $bindings[idx].refresh();
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
    
        // ...........................
        // PROTECTED METHODS
    
        //*@protected
        create: function () {
            // we do a single pass at each of the binding declarations
            // and pass them to our binding creation method
            var $bindings = this.bindings || (this.bindings = []);
            var len = $bindings.length;
            var idx = 0;
            // we reset our bindings array because it will be used by our
            // binding method to store references to bindings owned by
            // this object
            this.bindings = [];
            for (; idx < len; ++idx) this.binding($bindings[idx]);
        },
        
        //*@protected
        destroy: function () {
            // we simply iterate over and destroy each of the bindings
            // in our bindings array
            var $bindings = this.bindings;
            if (!$bindings.length) return;
            do { 
                $bindings.pop().destroy();
            } while ($bindings.length);
        }
    
        // ...........................
        // OBSERVERS
        
    });
    
}(enyo));
