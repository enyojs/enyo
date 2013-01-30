//*@public
/**
    The _enyo.ObjectController_ is a sophisticated proxy for
    underlying data. Other objects may observe or bind to its
    properties as if they were that of the underlying data object.
    This abstraction allows for the underlying data to be changed
    or modified without the other objects needing to rebind or
    be aware of the change. It can be subclassed to deal with
    specific data object implementations and special needs. This
    particular controller can handle native data hashes or any
    _enyo.Object_ or sub-kind. While data is being proxied by the
    controller, access to its properties should use the _get_ and
    _set_ method of the controller.
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.ObjectController",
    
    //*@public
    kind: "enyo.Controller",
        
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    _getting: false,
    
    //*@protected
    _listener: null,
    
    //*@protected
    _last: null,
        
    // ...........................
    // PUBLIC METHODS
    
    //*@public
    get: function (prop) {
        var ret;
        // it we are recursing we go straight to the default
        // or if the property is data - data is a reserved word
        // in this case otherwise we can't get a reference to the
        // object
        if ("data" === prop) return this.inherited(arguments);
        if (false === (ret = this.getDataProperty(prop))) {
            ret = this.inherited(arguments);
        }
        return ret;
    },
    
    //*@public
    set: function (prop, value) {
        if (!this.setDataProperty(prop, value)) {
            return this.inherited(arguments);
        }
    },
    
    //*@public
    /**
        This method is called by the object-controller's _set_ method
        to allow this portion to be overloaded cleanly in cases where
        there is a non-normative behavior required. Accepts the same
        parameters as the normal _set_ method but is expected to return
        a truthy/falsy value to indicate its success. The default behavior
        is to check to see if the _data_ property exists and if the property
        being set is a top-level property of that object. If not it returns
        false. Notification __is__ handled by this method to allow that
        behavior to be overloaded as well. It is responsible for determining
        the previous value and passing that to the notification method.
    */
    setDataProperty: function (prop, value) {
        var data = this.get("data");
        if (data && this.isAttribute(prop)) {
            // if the object is an enyo object instance its notifications will
            // automatically fire
            enyo.setPath.call(data, prop, value);
            // if it is instead a native object, we have already queued the
            // the notification so this will flush it, otherwise, it will do
            // nothing
            this.startNotifications();
            return true;
        }
        // under any other circumstances return false
        return false;
    },
    
    //*@public
    /**
        This method is called by the object-controller's _get_ method
        to allow this portion to be overloaded cleanly in cases where
        there is a non-normative behavior required. Accepts the same
        parameters as the normal _get_ method but is expected to return
        a truthy/explicit-boolean-false value to indicate its success. The
        default behavior is to check to see if the _data_ property exists
        and if the requested property is a first-level property of the object.
        If it is it will return the value. The default getter of the object-
        controller will only execute if this method returns an explicit false.
    */
    getDataProperty: function (prop) {
        var data = this.get("data");
        if (data && this.isAttribute(prop)) {
            return enyo.getPath.call(data, prop);
        }
        // under any other circumstance return false explicitly
        return false;
    },
    
    //*@public
    /**
        Takes a string parameter and returns a boolean true|false
        depending on whether or not the parameter is an attribute
        of the data object. If no data is present it will always return
        false. If the object has its own _isAttribute_ method it will
        return the the execute method. For more complex implementations
        overload this method.
    */
    isAttribute: function (prop) {
        var data = this.get("data");
        // if the object exists and has its own isAttribute method
        // use that otherwise use our default
        if (data) {
            if ("function" === typeof data.isAttribute) {
                return data.isAttribute(prop);
            } else if (data.hasOwnProperty(prop)) {
                return true;
            }
        }
        return false;
    },
    
    //*@public
    releaseData: function (data) {
        var data = data || this.get("data");
        // we need to go ahead and double check that the data exists
        // and is a valid enyo object instance
        if (!data || !(data instanceof enyo.Object)) return;
        // if we had a listener registered on the previous data we
        // need to remove it
        if (this._listener) {
            data.removeObserver("*", this._listener);
        }
        // clear any reference
        this._last = null;
    },
    
    //*@public
    sync: function () {
        var observers = this.observers;
        var observer;
        var prop;
        var handlers;
        var idx = 0;
        var len;
        var bnd;
        for (prop in observers) {
            handlers = observers[prop];
            if (!handlers || !handlers.length) continue;
            for (idx = 0, len = handlers.length; idx < len; ++idx) {
                observer = handlers[idx];
                if (observer.bindingId) {
                    bnd = enyo.Binding.map[observer.bindingId];
                    if (!bnd) continue;
                    bnd.sync();
                }
            }
        }
    },
    
    //*@public
    initData: function (data) {
        // if no data was passed in we try and grab the property
        // on our own
        var data = data || this.get("data");
        // we need to go ahead and double check that the data exists
        // and is a valid enyo object instance
        if (!data || !(data instanceof enyo.Object)) return;
        // register ourselves as a global listener on the object
        // via the special attribute '*'
        this._listener = data.addObserver("*", this.notifyObservers, this);
        // go ahead and setup our last reference for the future
        this._last = data;
    },
    
    // ...........................
    // PROTECTED METHODS    
    
    //*@protected
    create: function () {
        this.inherited(arguments);
        this.dataDidChange();
    },
    
    //*@protected
    /**
        This method attempts to find the correct target(s) and
        notify them of any/all the possible properties to force
        them to synchronize to the current values.
    */
    notifyAll: function () {
        // we will try and trick our bindings into firing by simply
        // triggering all of our registered observers since at this
        // moment it is the only way to be sure we get all bindings
        // not just our dispatch targets or owner
        var observers = this.observers;
        var handlers;
        var prop;
        for (prop in observers) {
            if (!observers.hasOwnProperty(prop)) continue;
            if (false === this.isAttribute(prop)) continue;
            handlers = observers[prop];
            enyo.forEach(handlers, function (fn) {
                if ("function" === typeof fn) fn();
            }, this);
        }
    },

    // ...........................
    // OBSERVERS METHODS    

    //*@protected
    /**
        This method is intended to fire only when the _data_ property is
        arbitrarily set on the object-controller.
    */
    dataDidChange: enyo.Observer(function () {
        if (this._last) this.releaseData(this._last);
        this.initData();
        this.notifyAll();
    }, "data")

});
