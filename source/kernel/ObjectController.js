enyo.kind({
    name: "enyo.ObjectController",
    kind: "enyo.Controller",
    //*@protected
    isGetting: false,
    //*@protected
    alwaysUseData: false,
    //*@protected
    registeredListenerOnData: null,
    //*@public
    /**
        Set this property to a method that will be called when
        the _findAndInstace_ on _data_ is called.
    */
    foundData: null,
    //*@protected
    create: function () {
        this.inherited(arguments);
        this.dataDidChange();
    },
    //*@public
    get: function (prop) {
        var ret;
        // it we are recursing we go straight to the default
        // or if the property is data - data is a reserved word
        // in this case otherwise we can't get a reference to the
        // object
        if (true === this.isGetting || "data" === prop) return this.inherited(arguments);
        // to avoid infinite recursion
        this.isGetting = true;
        if (false === (ret = this.getDataProperty(prop))) {
            ret = this.inherited(arguments);
        }
        this.isGetting = false;
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
        var always = this.alwaysUseData;
        var prev;
        if (data && (true === always || data.hasOwnProperty(prop))) {
            // if the data object is a native object then we need to make
            // sure to fire our own notifications, we retrieve the previous
            // value early and setup the notification to fire once the new
            // value has been set
            if (true !== always) {
                prev = enyo.getPath.call(data, prop);
                this.stopNotifications();
                this.notifyObservers(prop, prev, value);
            }
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
        var always = this.alwaysUseData;
        if (data && (true === always || data.hasOwnProperty(prop))) {
            return enyo.getPath.call(data, prop);
        }
        // under any other circumstance return false explicitly
        return false;
    },
    //*@protected
    /**
        This method is intended to fire only when the _data_ property is
        arbitrarily set on the object-controller.
    */
    dataDidChange: enyo.Observer(function () {
        if (this.lastData) this.releaseData(this.lastData);
        this.findAndInstance("data", this.foundData || function (ctor, inst) {
            if (inst) {
                if (inst instanceof enyo.Object) {
                    this.initData(inst);
                }
            }
        });
        this.lastData = this.get("data");
        this.notifyAll();
    }, "data"),
    //*@public
    releaseData: function (data) {
        var data = data || this.get("data");
        // we need to go ahead and double check that the data exists
        // and is a valid enyo object instance
        if (!data || !(data instanceof enyo.Object)) return;
        // reset our always flag
        this.alwaysUseData = false;
        // if we had a listener registered on the previous data we
        // need to remove it
        if (this.registeredListenerOnData) {
            data.removeObservers("*", this.registeredListenerOnData);
        }
        // clear any reference
        this.lastData = null;
    },
    //*@public
    initData: function (data) {
        // if no data was passed in we try and grab the property
        // on our own
        var data = data || this.get("data");
        // we need to go ahead and double check that the data exists
        // and is a valid enyo object instance
        if (!data || !(data instanceof enyo.Object)) return;
        // ok lets go ahead and set our always flag
        this.alwaysUseData = true;
        // register ourselves as a global listener on the object
        // via the special attribute '*'
        this.registeredListenerOnData = data.addObserver("*", this.notifyObservers, this);
        // go ahead and setup our last reference for the future
        this.lastData = data;
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
    }
});
