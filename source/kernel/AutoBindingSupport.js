(function () {
    
    var remapped = {
        bindFrom: "from",
        bindTo: "to",
        bindTransform: "transform",
        bindOneWay: "oneWay",
        bindAutoSync: "autoSync",
        bindDebug: "debug"
    };
    
    var defaults = {
        to: ".content",
        transform: null,
        oneWay: true,
        autoSync: false,
        debug: false
    };
    
    enyo.kind({
    
        // ...........................
        // PUBLIC PROPERTIES
        
        //*@public
        name: "enyo.AutoBindingSupport",
    
        //*@public
        kind: "enyo.Mixin",
    
        // ...........................
        // PROTECTED PROPERTIES
    
        //*@protected
        _did_setup_auto_bindings: false,
    
        // ...........................
        // COMPUTED PROPERTIES
    
        // ...........................
        // PUBLIC METHODS
    
        // ...........................
        // PROTECTED METHODS
    
        //*@protected
        create: function () {
            var cache = this._auto_cache = {};
            var ctor = this._binding_ctor = enyo.getPath(this.defaultBindingKind);
            var keys = enyo.keys(defaults);
            if (ctor !== enyo.Binding) {
                cache.defaults = enyo.mixin(enyo.clone(defaults), 
                    enyo.only(keys, ctor.prototype, true));
            } else cache.defaults = defaults;
            this.setupAutoBindings();
        },
        
        //*@protected
        autoBinding: function () {
            var bind = this.binding.apply(this, arguments);
            bind.autoBindingId = enyo.uid("autoBinding");
        },
        
        //*@protected
        autoBindings: enyo.Computed(function () {
            return enyo.filter(this.bindings || [], function (bind) {
                return bind && bind.autoBindingId;
            });
        }),
        
        //*@protected
        setupAutoBindings: function () {
            if (this._did_setup_auto_bindings) return;
            if (!this.controller) return;
            var controls = this.get("bindableControls");
            var idx = 0;
            var len = controls.length;
            var controller = this.controller;
            var control;
            var props;
            for (; idx < len; ++idx) {
                control = controls[idx];
                props = this.bindProperties(control);
                this.autoBinding(props, {source: controller, target: control});
            }
            this._did_setup_auto_bindings = true;
        },
        
        //*@protected
        bindProperties: function (control) {
            var cache = this._auto_cache.defaults;
            return enyo.mixin(enyo.clone(cache), enyo.remap(remapped, control));
        },
        
        //*@protected
        bindableControls: enyo.Computed(function (control) {
            var cache = this._auto_cache["bindableControls"];
            if (cache) return enyo.clone(cache);
            var bindable = [];
            var control = control || this;
            var controls = control.controls || [];
            var idx = 0;
            var len = controls.length;
            for (; idx < len; ++idx) {
                bindable = bindable.concat(this.bindableControls(controls[idx]));
            }
            if ("bindFrom" in control) bindable.push(control);
            if (this === control) this._auto_cache["bindableControls"] = enyo.clone(bindable);
            return bindable;
        }),
        
        //*@protected
        controllerDidChange: enyo.Observer(function () {
            this.inherited(arguments);
            if (this.controller) {
                if (!this._did_setup_auto_bindings) {
                    this.setupAutoBindings();
                }
            }
        }, "controller")
    
        // ...........................
        // OBSERVERS

    });
    
}());
