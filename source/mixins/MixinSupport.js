(function () {
    
    //*@protected
    /**
        When a kind is defined that is an _enyo.Mixin_ it is actually
        instanced immediately as a singleton to be reused by any other
        kind that cares to apply it.
    */
    var store = enyo.mixins = {};
    
    //*@protected
    /**
        Internally used to keep a more clear abstraction between mixins
        knowledge of available features of the framework.
    */
    var features = enyo.mixins.features = [];
    
    //*@protected
    var register = function (name, mixin) {
        if (store[name]) {
            enyo.error("enyo.createMixin: cannot create " + name + " because " +
                "it already exists");
        } 
        store[name] = mixin;
    };
    
    //*@public
    /**
        Creates a reusable hash of the properties to be applied for the
        the named mixin wherever it is requested.
    */
    var createMixin = enyo.createMixin = function (props) {
        if (!props) return false;
        // we need to grab the name but make sure it isn't stored as
        // a property on mixin hash
        var name = props.name
        // remove the name
        delete props.name;
        // if there isn't a name fail early
        if (!name) enyo.error("enyo.createMixin: cannot create mixin without name");
        register(name, props);
    };
    
    //*@public
    /**
        Used internally but accessible to arbitrarily apply a mixin to a
        class prototype.
    */
    var applyMixin = enyo.applyMixin = function (name, proto) {
        // retrieve the requested mixin
        var mixin = store[name];
        var ctors = proto._mixin_create || (proto._mixin_create = []);
        var dtors = proto._mixin_destroy || (proto._mixin_destroy = []);
        var applied = proto._applied_mixins = enyo.clone(proto._applied_mixins || []);
        var ctor;
        var dtor;
        var key;
        var prop;
        var fn;
        // if we can't find the mixin there is nothing we can do
        if (!mixin) return enyo.warn("enyo.applyMixin: could not find the " +
            "requested mixin -> " + name + " for " + proto.kindName,
            "(at the time of request available mixins are: " + enyo.keys(store).join(",") + ")");
        // if this mixin is already applied nothing we can do
        if (!!~applied.indexOf(name)) return enyo.warn("enyo.applyMixin: " +
            "attempt to apply mixin " + name + " to " + proto.kindName +
            " multiple times");
        // we look for the mixin's initialization routine    
        ctor = mixin.create;
        // we look for the mixin's destructor/cleanup routine
        dtor = mixin.destroy;
        for (key in mixin) {
            if (!mixin.hasOwnProperty(key)) continue;
            // skip the property if it is either of these
            if ("create" === key || "destroy" === key) continue;
            prop = mixin[key];
            // if the prototype has the property and it is a function we
            // insert the mixins function but allow it to chain the original
            // if it wants
            if (proto[key] && "function" === typeof proto[key]) {
                fn = proto[key];
                proto[key] = prop;
                prop._inherited = fn;
                prop.nom = name + "." + key + "()";
            } else proto[key] = prop;
        }
        // if there was a constructor plop it in the init routines
        if (ctor && "function" === typeof ctor) {
            ctors.push(ctor);
            ctor.nom = name + ".create()";
        }
        // if there was a destructor plop it in the destuctor routines
        if (dtor && "function" === typeof dtor) {
            dtors.push(dtor);
            dtor.nom = name + ".destroy()";
        }
        // add the name of this mixin to the applied mixins array
        applied.push(name);
        // give each available mixin feature the opportunity to handle properties
        enyo.forEach(features, function (fn) {fn(proto, mixin)});
    };
    
    //*@protected
    var _post_constructor = function () {
        if (!this._supports_mixins) return;
        // we need to initialize all of the mixins registered to this
        // kind
        this._create_mixins();
    };
    
    //*@protected
    /**
        We add a kind-feature to snag and handle all mixins for a given
        kind.
    */
    enyo.kind.features.push(function (ctor, props) {
        // see if there is a mixins array being applied to the kind
        var proto = ctor.prototype;
        var mixins = proto.mixins;
        // remove the array if it existed
        delete proto.mixins;
        // if there are any, we apply them to the constructor now
        enyo.forEach(mixins, function (name) {applyMixin(name, proto)});
    });
    
    //*@protected
    enyo.kind.postConstructors.push(_post_constructor);
    
    //*@protected
    createMixin({
        
        // ...........................
        // PUBLIC PROPERTIES
        
        //*@public
        name: "enyo.MixinSupport",
        
        // ...........................
        // PROTECTED PROPERTIES
        
        //*@protected
        _supports_mixins: true,
    
        // ...........................
        // COMPUTED PROPERTIES
    
        // ...........................
        // PUBLIC METHODS
    
        // ...........................
        // PROTECTED METHODS
    
        //*@protected
        _create_mixins: function () {
            enyo.forEach(this._mixin_create, function (fn) {fn.call(this)}, this);
        },
        
        //*@protected
        _destroy_mixins: function () {
            enyo.forEach(this._mixin_destroy, function (fn) {fn.call(this)}, this);
        },
        
        //*@protected
        destroy: function () {
            this._destroy_mixins();
        }
    
        // ...........................
        // OBSERVERS
        
    });
 
}());