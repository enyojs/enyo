//*@public
/**
	_enyo.ObjectController_ is a sophisticated proxy for underlying data.
	Other objects may observe or bind to its properties as if they belonged
	to the underlying data object. This abstraction allows the underlying
	data to be modified without the other objects' needing to rebind or be
	aware of the change. It may be extended to deal with specific data
	object implementations and special needs.

	This particular controller can handle native data hashes or any
	instances of _enyo.Object_ or its subkinds. While data is being proxied
	by the controller, its properties should be accessed using the
	controller's _get_ and _set_ methods.
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
		// if we are recursing, we go straight to the default
		// or if the property is data - data is a reserved word
		// in this case otherwise we can't get a reference to the
		// object
		if ("data" === prop) {
			return this.inherited(arguments);
		}
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
		Accepts the same parameters as the normal _set_ method, but returns
		a truthy/falsy value to indicate its success.  This method is called
		by the object controller's _set_ method to allow for clean
		overloading in cases where non-normative behavior is required.

		By default, this method checks to see whether the _data_ property
		exists and whether the property being set is a top-level property of
		the object. If these conditions are not met, the method returns false.

		Notifications are handled by this method, allowing that behavior to
		be overloaded as well. This method is responsible for determining the
		previous value and passing it to the notification method.
	*/
	setDataProperty: function (prop, value) {
		var data = this.get("data");
		if (data && this.isAttribute(prop)) {
			if (!(data instanceof enyo.Object)) {
				this.stopNotifications();
				this.notifyObservers(prop, this.get(prop), value);
			}
			// if the object is an enyo object instance, its notifications will
			// automatically fire
			enyo.setPath.call(data, prop, value);
			// if it is instead a native object, we have already queued the
			// the notification, so this will flush it; otherwise, it will do
			// nothing
			this.startNotifications();
			return true;
		}
		// under any other circumstances, return false
		return false;
	},

	//*@public
	/**
		Accepts the same parameters as the normal _get_ method, but returns
		a truthy or explicit-boolean-false value to indicate its success.
		This method is called by the object controller's _get_ method to
		allow for clean overloading cleanly in cases where non-normative
		behavior is required.

		By default, this method checks whether the _data_ property exists
		and whether the requested property is a first-level property of the
		object. If these conditions are met, the value is returned. The
		object controller's default getter will only execute if this method
		explicitly returns false.
	*/
	getDataProperty: function (prop) {
		var data = this.get("data");
		if (data && this.isAttribute(prop)) {
			return enyo.getPath.call(data, prop);
		}
		// under any other circumstances, return false explicitly
		return false;
	},

	//*@public
	/**
		Accepts a string parameter and returns a boolean true or false
		depending on whether that parameter is an attribute of the data
		object. Returns false if no data is present. If the object has
		its own _isAttribute_ method, the executed method is returned.
		For more complex implementations, overload this method.
	*/
	isAttribute: function (prop) {
		var data = this.get("data");
		// if the object exists and has its own isAttribute method
		// use that; otherwise, use our default
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
		data = data || this.get("data");
		// we need to go ahead and double check that the data exists
		// and is a valid enyo object instance
		if (!data || !(data instanceof enyo.Object)) {
			return;
		}
		// if we had a listener registered on the previous data, we
		// need to remove it
		if (this._listener) {
			data.removeObserver("*", this._listener);
		}
		// clear any reference
		this._last = null;
	},

	//*@public
	sync: function () {
		var observers = this._observers;
		var observer;
		var prop;
		var handlers;
		var idx = 0;
		var len;
		var bnd;
		for (prop in observers) {
			handlers = observers[prop];
			if (!handlers || !handlers.length) {
				continue;
			}
			for (idx = 0, len = handlers.length; idx < len; ++idx) {
				observer = handlers[idx];
				if (observer.bindingId) {
					bnd = enyo.Binding.map[observer.bindingId];
					if (!bnd) {
						continue;
					}
					bnd.sync();
				}
			}
		}
	},

	//*@public
	initData: function (data) {
		// if no data was passed in, we try to grab the property
		// on our own
		data = data || this.get("data");
		// we need to go ahead and double check that the data exists
		// and is a valid enyo object instance
		if (!data || !(data instanceof enyo.Object)) {
			return;
		}
		// register ourselves as a global listener on the object
		// via the special attribute '*'
		this._listener = data.addObserver("*", this.notifyObservers, this);
		// go ahead and set up our last reference for the future
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
		Attempts to find the correct targets and notify them of any/all
		possible properties to forciby synchronize them to their current
		values.
	*/
	notifyAll: function () {
		// we will try to trick our bindings into firing by simply
		// triggering all of our registered observers, since at this
		// moment that is the only way to be sure we get all bindings,
		// not just our dispatch targets or owner
		var observers = this._observers;
		var handlers;
		var prop;
		var callIfFunction = function(fn) {
			if ("function" === typeof fn) {
				fn();
			}
		};
		for (prop in observers) {
			if (!observers.hasOwnProperty(prop)) {
				continue;
			}
			if (false === this.isAttribute(prop)) {
				continue;
			}
			handlers = observers[prop];
			enyo.forEach(handlers, callIfFunction, this);
		}
	},

	// ...........................
	// OBSERVERS METHODS

	//*@protected
	/**
		Fires only when the _data_ property is arbitrarily set on the
		object controller.
	*/
	dataDidChange: enyo.observer(function () {
		if (this._last) {
			this.releaseData(this._last);
		}
		this.initData();
		this.notifyAll();
	}, "data")

});
