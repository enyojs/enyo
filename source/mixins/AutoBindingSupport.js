(function () {
    
    var remapped = {
        bindFrom: "from",
        bindTo: "to",
        bindTransform: "transform",
        bindOneWay: "oneWay",
        bindTwoWay: "twoWay",
        bindAutoSync: "autoSync",
        bindDebug: "debug"
    };
    
    var defaults = {
        to: ".content",
        transform: null,
        oneWay: true,
        twoWay: false,
        autoSync: false,
        debug: false
    };
    
    enyo.createMixin({
    
        // ...........................
        // PUBLIC PROPERTIES
        
        //*@public
        name: "enyo.AutoBindingSupport",
    
        // ...........................
        // PROTECTED PROPERTIES
    
        //*@protected
        _ab_did_setup: false,
        
        //*@protected
        _ab_did_init: false,
    
        // ...........................
        // COMPUTED PROPERTIES
    
        //*@protected
        _ab_bindable_controls: enyo.Computed(function (control) {
            var bindable = [];
            var control = control || this;
            var controls = control.controls || [];
            var idx = 0;
            var len = controls.length;
            for (; idx < len; ++idx) {
                bindable = bindable.concat(this._ab_bindable_controls(controls[idx]));
            }
            if ("bindFrom" in control) bindable.push(control);
            return bindable;
        }, {cached: true}),
    
        //*@protected
        _ab_defaults: enyo.Computed(function () {
            var ctor = this.get("_binding_constructor");
            var keys = enyo.keys(defaults);
            if (enyo.Binding !== ctor) {
                return enyo.mixin(enyo.clone(defaults),
                    enyo.only(keys, ctor.prototype, true));
            } else return enyo.clone(defaults);
        }, {cached: true, defer: false}),
    
        // ...........................
        // PUBLIC METHODS
    
        // ...........................
        // PROTECTED METHODS
    
        //*@protected
        create: function () {
            this.setupAutoBindings();
            this._ab_did_init = true;
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
        }, "_ab_did_setup", {cached: true}),
        
        //*@protected
        setupAutoBindings: function () {
            if (true === this._ab_did_setup) return;
            if (!this.controller || !(this.controller instanceof enyo.Controller)) return;
            var controls = this.get("_ab_bindable_controls");
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
            this.set("_ab_did_setup", true);
        },
        
        //*@protected
        bindProperties: function (control) {
            var props = this.get("_ab_defaults");
            return enyo.mixin(enyo.clone(props), enyo.remap(remapped, control));
        },
    
        // ...........................
        // OBSERVERS

        //*@protected
        _ab_controller_changed: enyo.Observer(function () {
            if (this.controller instanceof enyo.Controller) {
                if (!this._ab_did_setup) {
                    this.setupAutoBindings();
                }
            }
        }, "controller")

    });
    
}());
