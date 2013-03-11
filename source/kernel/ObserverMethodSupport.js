(function () {

    //*@public
    /**
        Takes a function followed by 1 or more string parameters that are
        targets for the observer. Returns a method with the appropriate properties
        to allow the system to notify it when the named properites have been
        modified.
    */
    var observer = enyo.Observer = enyo.observer = function (fn /* arguments */) {
        var events = enyo.toArray(arguments).slice(1);
        if (!enyo.exists(fn) || "function" !== typeof fn) {
            // this is a necessary assert
            throw "enyo.Observer: invalid observer, must have a function";
        }
        fn.isObserver = true;
        fn.events = (fn.events? fn.events: []).concat(events);
        return fn;
    };
        
    //*@public
    /**
        For any property on the object an observer can be added. Observers
        are registered via this method by passing in the property that should
        trigger the listener/observer and an optional context for the method
        to be executed under when it is triggered. Observers cannot be added
        for the same event more than once. Returns a reference to the function
        that was registered so it can be stored for later removal.
    */
    var addObserver = enyo.observer.addObserver = function (base, property, fn, context) {
        var observers = base._observers || (base._observers = {});
        var handlers;
        // if a context is provided for the listener we bind it
        // to that context now
        fn = context? enyo.bind(context, fn): fn;
        // if there are no registered handlers for this event
        // go ahead and create an array for them
        if (!enyo.exists(observers[property])) handlers = observers[property] = [];
        else handlers = observers[property];
        // only add it if it isn't already in the array
        if (!~handlers.indexOf(fn)) handlers.push(fn);
        // allow chaining
        return fn;
    };
    
    //*@public
    /**
        Attempts to remove the given listener/observer for the given
        property if it exists. Typically not called directly. If no function is
        supplied it will remove all listeners for the given property.
    */
    var removeObserver = enyo.observer.removeObserver = function (base, property, fn) {
        var observers = base._observers;
        var idx;
        var handlers;
        if (!(handlers = observers[property])) return this;
        if (enyo.exists(fn) && "function" === typeof fn) {
            idx = handlers.indexOf(fn);
            if (!!~idx) {
                // remove it from the array
                handlers.splice(idx, 1);
            }
        } else {
            // we need to remove ALL the observers of this property
            delete observers[property];
        }
    };
    
    //*@public
    /**
        Convenience method to remove all observers on all properties.
        Returns reference to this object for chaining. This will almost
        never need to be called by anything but the destroy method. Returns
        a reference to this object for chaining.
    */
    var removeAllObservers = enyo.observer.removeAllObservers = function (base) {
        var observers = base._observers;
        var handlers;
        var observer;
        var binding;
        var prop;
        var idx;
        for (prop in observers) {
            if (!observers.hasOwnProperty(prop)) continue;
            handlers = observers[prop];
            // orphan the array so it will be cleaned up by the GC
            observers[prop] = null;
            for (idx = 0, len = handlers.length; idx < len; ++idx) {
                observer = handlers[idx];
                // check to see if the observer is associated with a binding
                // if it is we need to notify it that we are being destroyed
                // this is a proactive check - it has a failsafe if this
                // didn't take place
                if (observer.bindingId) {
                    binding = enyo.Binding.map[observer.bindingId];
                    if (binding && binding instanceof enyo.Binding) binding.destroy();
                }
            }
        }
        // reset our observers hash
        base._observers = {};
        return base;
    };
    
    //*@public
    /**
        Notifies any observers for a given property. Accepts the previous
        value, the current value. Looks for a backwards compatible function
        of the _propertyChanged_ form and will call that if it exists while
        also notifying other observers.
    */
    var notifyObservers = enyo.observer.notifyObservers = function (base, property, prev, value) {
        var observers = base._observers || {};
        var handlers = (observers[property] || []);
        var idx = 0;
        var fn;
        var ch = enyo.uncap(property) + "Changed";
        if ("*" !== property) handlers = enyo.merge(handlers, observers["*"] || []);
        if (handlers) {
            for (; idx < handlers.length; ++idx) {
                fn = handlers[idx];
                if (!enyo.exists(fn) || "function" !== typeof fn) continue;
                if (false === base._allow_notifications) {
                    base.addNotificationToQueue(property, fn, [property, prev, value]);
                } else {
                    fn.call(base, property, prev, value);
                }
            }
        }
        
        if (enyo.exists(base[ch]) && "function" === typeof base[ch]) {
            if (false === base._allow_notifications) {
                base.addNotificationToQueue(property, base[ch], [prev, value]);
            } else {
                base[ch].call(base, prev, value);
            }
        }
        return base;
    };
    
    //*@protected
    /**
        This is used internally when a notification is queued.
    */
    var addNotificationToQueue = enyo.observer.addNotificationToQueue = function (base, property, fn, params) {
        var queue = base._notification_queue || (base._notification_queue = {});
        var handlers = queue[property];
        params = params || [];
        if (false === base._allow_notification_queue) return;
        if (!enyo.exists(handlers)) {
            // create an entry for base property note that the queue for
            // every property uses the first array index as the parameters
            queue[property] = [params, fn];
        } else {
            // update the properties for base entry so if the value has
            // been updated before the queue is flushed it uses the most
            // recent values
            // TODO: replace me with something that will actually work!
            if (handlers[0] !== params) handlers.splice(0, 1, params);
            if (!~handlers.indexOf(fn)) handlers.push(fn);
        }
    };
    
    //*@public
    /**
        Call this method in order to keep all notifications on this object
        from firing. This does not clear/flush the queue. Any notifications
        fired during the time they are disabled will be added to the queue.
        The queue can be arbitrarily flushed or cleared when ready. If a
        boolean true is passed to this method it will disable the queue as
        well. Disabling the queue will immediately clear (not flush) it as well.
        Increments an internal counter that requires the _startNotifications_
        method to be called the same number of times before notifications will
        be enabled again. The queue, if any, cannot be flushed if the counter
        is not 0.
    */
    var stopNotifications = enyo.observer.stopNotifications = function (base, disableQueue) {
        base._allow_notifications = false;
        base._stop_count += 1;
        if (true === disableQueue) {
            base.disableNotificationQueue();
        }
    };
    
    //*@public
    /**
        Call this method to enable notifications for this object and immediately
        flush the notification queue if the internal counter is 0. If notifications 
        were already enabled it will have no effect. Otherwise it will decrement the
        internal counter. If the counter becomes 0 it will allow notifications and
        attempt to flush the queue if there is one and it is enabled. This method
        must be called once for each time the _stopNotifications_ method was called.
        Passing a boolean true to this method will reenable the notification queue
        if it was disabled.
    */
    var startNotifications = enyo.observer.startNotifications = function (base, enableQueue) {
        if (0 !== base._stop_count) --base._stop_count;
        if (0 === base._stop_count) {
            base._allow_notifications = true;
            base.flushNotifications();
        }
        if (true === enableQueue) base.enableNotificationQueue();
    };
    
    //*@public
    /**
        Call this method to enable the notification queue. If it was already
        enabled it will have no effect. If notifications are currently enabled
        this will have no effect until they are disabled.
    */
    var enableNotificationQueue = enyo.observer.enableNotificationsQueue = function (base) {
        base._allow_notification_queue = true;
    };
    
    //*@protected
    /**
        This method is used internally to flush any notifications that have been
        queued.
    */
    var flushNotifications = enyo.observer.flushNotifications = function (base) {
        if (0 !== base._stop_count) return;
        var queue = base._notification_queue;
        var fn;
        var property;
        var handlers;
        var params;
        if (!enyo.exists(queue) || false === base._allow_notification_queue) return;
        for (property in queue) {
            if (!queue.hasOwnProperty(property)) continue;
            handlers = queue[property];
            params = handlers.shift();
            // if an entry just so happens to be added improperly by someone
            // trying to bypass the default means by which to add something to
            // the queue...
            if ("function" === typeof params) {
                handlers.unshift(params);
                params = [];
            }
            while (handlers.length) {
                fn = handlers.shift();
                fn.apply(base, params);
            }
        }
    };
    
    //*@public
    /**
        Call this method to disable the notification queue. If it was already
        disabled it will have no effect. If notifications are currently enabled
        this will have no effect. If they are disabled future notifications will
        not be queued and any in the queue will be cleared (not flushed).
    */
    var disableNotificationQueue = enyo.observer.disableNotificationQueue = function (base) {
        base._allow_notification_queue = false;
        base._notification_queue = {};
    };
    
    var findObservers = function (proto, props) {
        var prop;
        for (prop in props) {
            if ("function" === typeof props[prop] && true === props[prop].isObserver) {
                enyo.forEach(props[prop].events, function (event) {
                    addObserver(proto, event, props[prop]);
                });
            }
        }
    };
    
    enyo.kind.features.push(function (ctor, props) {findObservers(ctor.prototype, props)});
    
    //*@protected
    /**
        Add a special handler for mixins to be aware of how to handle
        observer properties of a kind.
    */
    enyo.mixins.features.push(findObservers);
    
    //*@protected
    enyo.createMixin({
        // ...........................
        // PUBLIC PROPERTIES
    
        //*@public
        name: "enyo.ObserverSupport",
    
        // ...........................
        // PROTECTED PROPERTIES
        
        //*@protected
        _stop_count: 0,
        
        //*@protected
        _notification_queue: null,
        
        //*@protected
        _allow_notifications: true,
        
        //*@protected
        _allow_notification_queue: true,
    
        // ...........................
        // PUBLIC METHODS
        
        //*@public
        /**
            For any property on the object an observer can be added. Observers
            are registered via this method by passing in the property that should
            trigger the listener/observer and an optional context for the method
            to be executed under when it is triggered. Observers cannot be added
            for the same event more than once. Returns a reference to the function
            that was registered so it can be stored for later removal.
        */
        addObserver: function (property, fn, context) {
            return addObserver(this, property, fn, context);
        },
        
        //*@public
        /**
            Attempts to remove the given listener/observer for the given
            property if it exists. Typically not called directly. If no function is
            supplied it will remove all listeners for the given property.
        */
        removeObserver: function (property, fn) {
            return removeObserver(this, property, fn);
        },
        
        //*@public
        /**
            Convenience method to remove all observers on all properties.
            Returns reference to this object for chaining. This will almost
            never need to be called by anything but the destroy method. Returns
            a reference to this object for chaining.
        */
        removeAllObservers: function () {
            return removeAllObservers(this);
        },
        
        //*@public
        /**
            Notifies any observers for a given property. Accepts the previous
            value, the current value. Looks for a backwards compatible function
            of the _propertyChanged_ form and will call that if it exists while
            also notifying other observers.
        */
        notifyObservers: function (property, prev, value) {
            return notifyObservers(this, property, prev, value);
        },

        //*@public
        /**
            Call this method in order to keep all notifications on this object
            from firing. This does not clear/flush the queue. Any notifications
            fired during the time they are disabled will be added to the queue.
            The queue can be arbitrarily flushed or cleared when ready. If a
            boolean true is passed to this method it will disable the queue as
            well. Disabling the queue will immediately clear (not flush) it as well.
            Increments an internal counter that requires the _startNotifications_
            method to be called the same number of times before notifications will
            be enabled again. The queue, if any, cannot be flushed if the counter
            is not 0.
        */
        stopNotifications: function (disableQueue) {
            return stopNotifications(this, disableQueue);
        },

        //*@public
        /**
            Call this method to enable notifications for this object and immediately
            flush the notification queue if the internal counter is 0. If notifications 
            were already enabled it will have no effect. Otherwise it will decrement the
            internal counter. If the counter becomes 0 it will allow notifications and
            attempt to flush the queue if there is one and it is enabled. This method
            must be called once for each time the _stopNotifications_ method was called.
            Passing a boolean true to this method will reenable the notification queue
            if it was disabled.
        */
        startNotifications: function (enableQueue) {
            return startNotifications(this, enableQueue);
        },
        
        //*@public
        /**
            Call this method to enable the notification queue. If it was already
            enabled it will have no effect. If notifications are currently enabled
            this will have no effect until they are disabled.
        */
        enableNotificationQueue: function () {
            return enableNotificationQueue(this);
        },
        
        //*@public
        /**
            Call this method to disable the notification queue. If it was already
            disabled it will have no effect. If notifications are currently enabled
            this will have no effect. If they are disabled future notifications will
            not be queued and any in the queue will be cleared (not flushed).
        */
        disableNotificationQueue: function () {
            return disableNotificationQueue(this);
        },
    
        // ...........................
        // PROTECTED METHODS
        
        //*@protected
        /**
            This is used internally when a notification is queued.
        */
        addNotificationToQueue: function (property, fn, params) {
            return addNotificationToQueue(this, property, fn, params);
        },
        
        //*@protected
        /**
            This method is used internally to flush any notifications that have been
            queued.
        */
        flushNotifications: function () {
            return flushNotifications(this);
        },
    
        //*@protected
        create: function () {
            this._observers = this._observers? enyo.clone(this._observers): {};
        },
    
        //*protected
        destroy: function () {
            this.removeAllObservers();
        }

    })
    
}());