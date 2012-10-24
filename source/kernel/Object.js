/**
_enyo.Object_ implements the Enyo framework's property publishing system, as
well as providing several utility functions for its subkinds.

Published properties are declared in a hash called _published_ within a call
to _enyo.kind_. Getter and setter methods are automatically generated for
properties declared in this manner. Also, by convention, the setter for a
published property will trigger an optional _&lt;propertyName&gt;Changed_ method
when called.

For more information, see the [documentation on Published
Properties](https://github.com/enyojs/enyo/wiki/Published-Properties) in the
Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Object",
	//* @protected
	// has no base kind
	kind: null,
	constructor: function() {
		enyo._objectCount++;

    // setup observers, bindings and computed properties
    this._setup();
	},
	/**
		Sets property named 'n' with value 'v' and then invokes callback
		function 'cf' (if specified), passing in the original value of 'n'.
		All property setting should bottleneck here so that objects can
		observe changes wlog.
	*/
	setPropertyValue: function(n, v, cf) {
	    var old = this[n];
		if (this[cf]) {
			this[n] = v;
			this[cf](old);
		} else {
			this[n] = v;
		}
        //console.log("setProperty: ", n, old, v, this);
        if (old !== v) this.notifyObservers(n, old, v);
	},
	_setProperty: function(n, v, cf) {
		this.setPropertyValue(n, v, (this.getProperty(n) !== v) && cf);
	},
	//* @public
	//* Destroys object with passed-in name.
	destroyObject: function(inName) {
		if (this[inName] && this[inName].destroy) {
			this[inName].destroy();
		}
		this[inName] = null;
	},
	//* Gets value of property with passed-in name.
	getProperty: function(n) {
		var getter = "get" + enyo.cap(n);
		if (this[getter]) {
			return this[getter]();
		}
		return this[n];
	},
	//* Sets value of property named 'n' to 'v'.
	setProperty: function(n, v) {
		var setter = "set" + enyo.cap(n);
		if (this[setter]) {
			this[setter](v);
		} else {
			this._setProperty(n, v, n + "Changed");
		}
	},
	/**
		Sends a log message to the console, prepended with the name of the kind
		and method from which _log_ was invoked.  Multiple arguments are coerced
		to String and joined with spaces.

			enyo.kind({
				name: "MyObject",
				kind: enyo.Object,
				hello: function() {
					this.log("says", "hi");
					// shows in the console: MyObject.hello: says hi
				}
			});
	*/
	log: function() {
		var acc = arguments.callee.caller;
		var nom = ((acc ? acc.nom : "") || "(instance method)") + ":";
		enyo.logging.log("log", [nom].concat(enyo.cloneArray(arguments)));
	},
	//* Same as _log_, except uses the console's warn method (if it exists).
	warn: function() {
		this._log("warn", arguments);
	},
	//* Same as _log_, except uses the console's error method (if it exists).
	error: function() {
		this._log("error", arguments);
	},
	//* @protected
	_log: function(inMethod, inArgs) {
		if (enyo.logging.shouldLog(inMethod)) {
			try {
				throw new Error();
			} catch(x) {
				enyo.logging._log(inMethod, [inArgs.callee.caller.nom + ": "].concat(enyo.cloneArray(inArgs)));
				//console.log(x.stack);
			}
		}
	},

  _setupBindings: function () {
    var p, prop, i, b;
    this.clearBindings();
    b = this._bindings = [];
    for (p in this) {
      if (!(prop = this[p])) continue;
      if ("bindings" === p && enyo.isArray(prop)) {
        for (i = 0; i < prop.length; ++i) {
          b.push(new enyo.Binding({owner: this, autoConnect: true}, prop[i]))
        }
      }
    }
  },

  _setupComputed: function () {
    var p, prop, i, c;
    c = this._computed = {};
    for (p in this) {
      if (!(prop = this[p])) continue;
      if (enyo.isFunction(prop)) {
        if (prop.isProperty) {
          c[p] = prop;
          for (i = 0; i < prop.properties.length; ++i) {
            this.addObserver(prop.properties[i],
              enyo.bind(this, function (prop) {
                this.notifyObservers(prop, null, this.get(prop), true);
              }, p));
          }
        }
      }
    }
  },
  
  _setupObservers: function () {
    var p, prop, i, e;
    this._observers = {};
    for (p in this) {
      if (!(prop = this[p])) continue;
      if (enyo.isFunction(prop)) {
        if (prop.isObserver && prop.events && prop.events.length) {
          for (i = 0; i < prop.events.length; ++i) {
            e = prop.events[i];
            this.addObserver(e, prop);
          }
        }
      }
    }
  },

  _setup: function () {
    this._setupObservers();
    this._setupComputed();
    this._setupBindings();
  },
  
    
    addObserver: function (inProp, inFunc, inContext) {
      var o = this._observers, t, f;

      //console.log("enyo.Object.addObserver: ", inProp);

      f = inContext? enyo.bind(inContext, inFunc): inFunc;
      
      // TODO: this should be handled differently, maybe throw a fatal?
      if (!enyo.isFunction(f)) {
        enyo.warn("enyo.Object.addObserver: must supply a valid function if no " +
          "context is set for the callback, a default `empty` handler has been " + 
          "used instead (property " + inProp + ")");
        f = enyo.nop; // can only be released if removeAllObservers is called
                            // or is manually removed
      }

      // TODO: this is probably ok but this does not have any
      // check to see if the property even exists for the object
      // if no observer array has already been created for this
      // property, go ahead and create it
      if (!(t = o[inProp])) t = o[inProp] = [];
      if (t.indexOf(f) === -1) t.push(f);

      // allow chaining
      return this; 
    },

    removeObserver: function (inProp, inFunc) {
      var o = this._observers, t, i;

      //console.log("enyo.Object.removeObserver: ", inProp);

      if (!(t = o[inProp])) return this; // nothing to do
      i = t.indexOf(inFunc);
      if (i < 0) {
        //enyo.warn("enyo.Object.removeObserver: could not remove observer " +
        //  inProp + " because the listener supplied did not exist");
        return this;
      }

      // remove it from the listeners array
      t.splice(i, 1);

      // allow chaining
      return this;
    },

    removeAllObservers: function () {
      var o = this._observers, p;

      //console.log("enyo.Object.removeAllObservers");

      for (p in o) {
        if (!o.hasOwnProperty(p)) continue;
        o[p] = null;
      }
      this._observers = {};
      return this;
    },

    notifyObservers: function (inProp, oldVal, newVal, force) {
      
      var o = this._observers, c = this._computed, t = o[inProp], i = 0, fn,
          ch_name = inProp[0].toLowerCase() + inProp.slice(1) + "Changed";
      
      if (this[ch_name] && enyo.isFunction(this[ch_name])) {
        if (!this._allowNotifications) {
          this.addNotificationToQueue(inProp, this[ch_name], [oldVal, newVal]);
        } else { this[ch_name].call(this, oldVal, newVal); }
      }

      if (t) {
        for (; i < t.length; ++i) {
          fn = t[i];
          if (!fn || !enyo.isFunction(fn)) continue;

          // TODO: for now this cannot be asynchronous without destroying
          // two-way bindings
          if (!this._allowNotifications) {
            this.addNotificationToQueue(inProp, fn, [inProp, oldVal, newVal]);
          //} else { fn.call(this, inProp, oldVal, newVal); }
          //enyo.asyncMethod(this, fn, inProp, oldVal, newVal);
          } else {
            enyo.asyncMethod(this, fn, inProp, oldVal, newVal);
          }
        }
      }
    },
    
    _notificationQueue: null,
    _allowNotifications: true,
    
    addNotificationToQueue: function (prop, fn, params) {
      var q = this._notificationQueue || (this._notificationQueue = {}), e = q[prop];
      if (!e) {
        e = (q[prop] = [params || [], fn]);
      } else {
        // we update the params to whatever is most current in case
        // they have been updated more than once while notifications
        // are off...
        if (params) e.splice(0, 1, params);
        if (e.indexOf(fn) === -1) e.push(fn);
      }
    },
    
    stopNotifications: function () {
      // TODO: this may not be desirable to assume a reset of the
      // queue EVERY time this is called...
      this._notificationQueue = {};
      this._allowNotifications = false;
    },
    
    startNotifications: function () {
      this._allowNotifications = true;
      this.flushNotifications();
    },
    
    flushNotifications: function () {
      var q = this._notificationQueue || {}, fn, p, n, params;
      for (p in q) {
        n = q[p];
        if (n && enyo.isArray(n)) {
          params = n.length > 1? n.shift(): [];
          while (n.length) {
            fn = n.shift();
            if (fn && enyo.isFunction(fn)) {
              // async?
              fn.apply(this, params);
            }
          }
        }
      }
    },

    binding: function () {
      var args = enyo.toArray(arguments), props = {}, i = 0, b;
      for (; i < args.length; ++i) enyo.mixin(props, args[i]);
      b = new enyo.Binding({owner: this, autoConnect: true}, props);
      this._bindings.push(b);
      return b;
    },

    clearBindings: function (inBindings) {
      var b = inBindings || this._bindings, i = 0, bnd;
      if (b && b.length > 0) {
        while (b.length) {
          bnd = b.shift();
          bnd.destroy();
        }
      }
    },

    //-----------------------
    
    get: function () {
      var get_n = "get" + enyo.cap(arguments[0]);
      if (this[get_n] && this[get_n].overloaded === true) return this[get_n]();
      return enyo._getPath.apply(this, arguments);
    },
    
    set: function () {
      return enyo._setPath.apply(this, arguments);
    },
    
    extend: function () {
      var args = enyo.toArray(arguments), ext, prop;
      while (args.length) {
        ext = args.shift();
        for (prop in ext) {
          if (!ext.hasOwnProperty(prop)) continue;
          if (this[prop]) {
            if (!this._stored) this._stored = {};
            // can manually call this method...
            // NOTE: the intention is not perfect preservation
            // of any extension/base, as common properties
            // will be overwritten by the last one to be found
            this._stored[prop] = ext[prop];
          } else this[prop] = ext[prop];
        }
      }
    }
    
});

//* @protected

enyo._objectCount = 0;

enyo.Object.subclass = function(ctor, props) {
	this.publish(ctor, props);
};

enyo.Object.publish = function(ctor, props) {
	var pp = props.published;
	if (pp) {
		var cp = ctor.prototype;
		for (var n in pp) {
      // need to make sure that even though a property is "published"
      // it does not overwrite any computed properties
      if (props[n] && enyo.isFunction(props[n]) && props[n].isProperty) continue;
			enyo.Object.addGetterSetter(n, pp[n], cp);
		}
	}
};

enyo.Object.addGetterSetter = function(inName, inValue, inProto) {
	var priv_n = inName;
	inProto[priv_n] = inValue;
	//
	var cap_n = enyo.cap(priv_n); 
	var get_n = "get" + cap_n;
	if (!inProto[get_n]) {
	  
	  inProto[get_n] = function () {
	    return this.get(priv_n);
	  };
	  inProto[get_n].overloaded = false;
  } else if (inProto[get_n].overloaded !== false){
    inProto[get_n].overloaded = true;
  }
	//
	var set_n = "set" + cap_n;
	var change_n = priv_n + "Changed";
	if (!inProto[set_n]) {
	  inProto[set_n] = function () {
	    return this.set(priv_n, arguments[0]);
	  }
	}
};