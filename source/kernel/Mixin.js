(function () {
  
    //*@public
    /**
        The mixin-pattern allows the creation of a mixin pseudo-kind
        with properties that are added to another kind, allows a separate
        initialization and destructor. The purpose of enyo.Mixin is
        similar to allowing multiple inheritance.
    */
    enyo.Mixin = function (properties) {
        return new Mixin(properties);
    };
    
    //*@protected
    function Mixin (properties) {
        var store = enyo.mixin(enyo.clone(Mixin.defaults), properties);
        var keys = enyo.union(Mixin.ignore, enyo.keys(store));
        var name = properties.name;
        enyo.setPath(name, this);
        enyo.mixin(this, store);
        this.properties = keys;
    }
  
    //*@protected
    Mixin.defaults = {
        initMixin: null,
        destroyMixin: null,
        name: ""
    };
    
    //*@protected
    Mixin.ignore = ["initMixin", "destroyMixin", "name"];
  
    //*@protected
    Mixin.prototype = {
        //*@protected
        isMixin: true,
        //*@public
        apply: function (target) {
            var mixins = target.appliedMixins || (target.appliedMixins = []);
            var fn;
            if (!!~mixins.indexOf(this)) return;
            else mixins.push(this.name);
            target.extend(this.get("extension"));
            this.injectDestructor(target);
            if (true === target.didSetupObservers) {
                target.setupObservers(true);
            }
            // if the target has not setup its bindings it is always safer
            // and sometimes mandatory to queue the mixin initialization 
            if (this.initMixin) {
                if (true === target.didSetupBindings) {
                    this.initMixin.call(target);
                } else {
                    // this is a special case, usually try not to declare
                    fn = enyo.proxyMethod(this.initMixin, target);
                    target.addObserver("didSetupBindings", fn);
                }
            }
        },
        //*@protected
        get: function () {
            return enyo.getPath.apply(this, arguments);
        },
        //*@protected
        extension: enyo.Computed(function () {
            var ret = {};
            var properties = this.properties;
            enyo.forEach(properties, function (property) {
                ret[property] = this[property];
                if ("function" === typeof this[property]) {
                    ret[property].nom = this.name + "." + property;
                }
            }, this);
            return ret;
        }),
        //*@protected
        injectDestructor: function (target) {
            var base = target.destroy || enyo.nop;
            var fn = this.destroyMixin;
            if ("function" !== typeof fn) return;
            fn = target.destroy = enyo.proxyMethod(fn, target);
            fn._inherited = base;
        }
    };
 
}());