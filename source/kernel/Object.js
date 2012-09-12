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
        this.notifyObservers(n, old, v);
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

    //----------------------- CD: Binding methods

    // now sets observers and bindings properly in a single loop
    // instead of 2
    _setup: function () {
	  var p, fn, i, e, b;

      //console.log("enyo.Object._setupObservers: ", this.kindName); 

      // make sure we have an observer hash to use
      this._observers = {};
      b = this._bindings = {};

      // here we try to find functions with observers attached
      // and actually initialize them for the object
      for (p in this) {
        if (!(fn = this[p])) continue;
        if (enyo.isFunction(fn)) {
          if (fn.events && fn.events.length > 0 && !fn.isSetup) {

            //console.log("enyo.Object._setupObservers: found function with events");

            for (i = 0; i < fn.events.length; ++i) {
              e = fn.events[i];
              this.addObserver(e, fn);
            }
            fn.isSetup = true;
          } else if (fn.isProperty && !fn.isSetup) {
            // LEFT OFF HERE!


          }
        } else if (fn.kindName && fn.kindName === "enyo._Binding") {
          //console.log("enyo.Object._setupObservers: found a binding for ", p);
          if (!fn.isSetup);
          b[p] = fn;
          this[p] = "";
          if (!fn.target) fn.target = this;
          if (!fn.targetProp) fn.targetProp = p;
          fn._owner = this;
          fn.create();
          fn.isSetup = true;
        }
      }
    },

    //----------------------- CD: Observer methods

    
    addObserver: function (inProp, inFunc, inContext) {
      var o = this._observers, t, f;

      //console.log("enyo.Object.addObserver: ", inProp);

      f = inContext? enyo.bind(inContext, inFunc): inFunc;
      
      // TODO: this should be handled differently, maybe throw a fatal?
      if (!enyo.isFunction(f)) {
        enyo.warn("enyo.Object.addObserver: must supply a valid function if no " +
          "context is set for the callback, a default `empty` handler has been " + 
          "used instead (property " + inProp + ")");
        f = function () {}; // can only be released if removeAllObservers is called
                            // or is manually removed
      }

      // TODO: this is probably ok but this does not have any
      // check to see if the property even exists for the object
      // if no observer array has already been created for this
      // property, go ahead and create it
      if (!(t = o[inProp])) t = o[inProp] = [];
      t.push(f);

      // allow chaining
      return this; 
    },

    removeObserver: function (inProp, inFunc) {
      var o = this._observers, t, i;

      //console.log("enyo.Object.removeObserver: ", inProp);

      if (!(t = o[inProp])) return this; // nothing to do
      i = t.indexOf(inFunc);
      if (i < 0) {
        enyo.warn("enyo.Object.removeObserver: could not remove observer " +
          inProp + " because the listener supplied did not exist");
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

    notifyObservers: function (inProp, oldVal, newVal) {
      var o = this._observers, t = o[inProp], i = 0, fn;

      // TODO: there is definitely a better place for this but
      // other things need to also be considered so for now
      // its being placed here
      if (oldVal === newVal) return;

      //console.log("enyo.Object.notifyObservers: ", inProp, oldVal, newVal);

      if (!t) return this;
      for (; i < t.length; ++i) {
        fn = t[i];
        if (!fn || !enyo.isFunction(fn)) continue;
        enyo.asyncMethod(this, fn, inProp, oldVal, newVal);    
      }
    }

    //-----------------------
    
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
	  
	  // if the value is a function, use that instead
	  if (enyo.isFunction(inValue) && inValue.isProperty) {
	    inProto[get_n] = inValue;
	  } else {
		  inProto[get_n] = function() { 
		  	return this[priv_n];
		  };
	  }
	}
	//
	var set_n = "set" + cap_n;
	var change_n = priv_n + "Changed";
	if (!inProto[set_n]) {
		inProto[set_n] = function(v) { 
			this._setProperty(priv_n, v, change_n); 
		};
	}
};


//----------------------- CD: MOVE ME


  /* GENERAL NOTES WHILE IMPLEMENTING

    Binding to objects that aren't created *yet* ... 
    This has caused me to place a few calls in places that I don't think they
    should be or are causing them to be called more than once in the chain.

    For instance, enyo.Object now has a method to setup observers and bindings which it
    must have, but for components in uiComponents this call is made PRIOR to the
    properties being mixed into it that need to be so it must be RERUN in order to find
    and configure them in the chain properly...

    Will need to look at a complete diff of files to see what has been added/modified.

    Relative paths in binding declarations...related to above.

  */


  // trickeration for chaining/convenience
  enyo.Binding = function () {
    return new enyo._Binding(arguments[0]);
  };

  enyo.IntegerBinding = function () {
    var r = new enyo._Binding(arguments[0]);
    return r.transform(function (inValue) {return Math.floor(parseInt(inValue))});
  };

  // private class
  enyo.kind({
    name: "enyo._Binding",
    kind: null,
    target: null,
    targetProp: "",
    source: null,
    sourceProp: null,
    _oneWay: false,
    isConnected: false,
    autoConnect: true,
    autoSync: true,
    _owner: null,
    isCreated: false,
    _transform: null,
    constructor: function (inSource) {
      //console.log("enyo._Binding.constructor: ", inSource);
      this.source = inSource;
      return this;
    },
    create: function () {
      //console.log("enyo._Binding.create: ", this);

      this.source = this.getSource();
      this.target = this.getTarget();

      this.isCreated = true;

      if (this.autoConnect) this.connect();
      if (this.autoSync && this.isConnected) this.syncSource();
      return this;
    },
    objectForPath: function (path, which) {
      var o = this._owner, p, prop, r = false, ret;
      p = path.split(".");
      prop = p.pop();
      this[which] = prop;
      if (path[0] === ".") {
        p.shift();
        r = true;
      }
      ret = enyo._getProp(p, false, r? o: null);
      if (!ret) throw "enyo._Binding.objectForPath: could not find " + path;
      return ret;
    },
    getTarget: function () {
      var t = this.target;
      if (t && !enyo.isString(t)) return t;
      else return this.objectForPath(t, "targetProp");
    },
    getSource: function () {
      var s = this.source;
      if (s && !enyo.isString(s)) return s;
      else return  this.objectForPath(s, "sourceProp");
    },
    validate: function () {
      //console.log("enyo._Binding.validate: ", this.target, this.targetProp, this.source, this.sourceProp);
      return this.getTarget() && this.targetProp && this.getSource() && this.sourceProp;
    },
    connect: function () {

      // this will force it to initialize and it will return here if
      // it is supposed to but allows an end-developer to call `.connect()`
      // which seems to be more logical than calling an initializer like `create`
      if (!this.isCreated) return this.create();

      //console.log("enyo._Binding.connect");
      var o = this._oneWay, t, tp, s, sp;
      if (this.isConnected) return this;
      if (!this.validate()) {
        return this;
      }

      //console.log("enyo._Binding.connect: connecting");
      
      // register the correct listeners where possible
      // this is where things get hairy for other types of objects
      // and where we should push the API lower instead of dealing
      // with it here
      t = this.target;
      tp = this.targetProp;
      s = this.source;
      sp = this.sourceProp;

      // we store these for later
      this._sourceResponder = enyo.bind(this, this.syncSource, sp);
      this._targetResponder = enyo.bind(this, this.syncTarget, tp);
      
      s.addObserver(sp, this._sourceResponder);

      // if this is NOT a one way binding we add the other
      // observer as well
      if (!o) t.addObserver(tp, this._targetResponder);

      // that should be it!
      this.isConnected = true;
      return this;
    },
    syncSource: function () {
      //console.log("enyo._Binding.syncSource");

      var t, tp, v, c, fn, tr = this._transform;
      v = this.getSourceValue();
      c = this.getTargetValue();

      // if they are the same, do nothing anyways
      if (c === v) return;
      t = this.target;
      tp = this.targetProp;
      fn = t["set" + enyo.cap(tp)];
      //console.log(fn);
      if (!fn || !enyo.isFunction(fn))
        throw "enyo._Binding.syncSource: could not find setter on target";

      // this is synchronous
      fn.call(t, tr? tr(v, "source"): v);
    },
    syncTarget: function () {
      //console.log("enyo._Binding.syncTarget");

      var o = this._oneWay, s, sp, v, c, fn, tr = this._transform;

      // if its oneWay, changes this direction are ignored
      if (o) return;
      v = this.getTargetValue();
      c = this.getSourceValue();

      // if they are the same, do nothing anyways
      if (c === v) return;
      s = this.source;
      sp = this.sourceProp;
      fn = s["set" + enyo.cap(sp)];
      if (!fn || !enyo.isFunction(fn))
        throw "enyo._Binding.syncTarget: could not find setter on source";
      
      // this is synchronous
      fn.call(s, tr? tr(v, "target"): v);
    },
    getSourceValue: function () {
      var s = this.getSource(), sp = this.sourceProp, n = "get" + enyo.cap(sp), v;
      v = s[n];
      if (enyo.isFunction(v)) return v.call(s)
      else return s[sp];
    },
    getTargetValue: function () {
      var t = this.getTarget(), tp = this.targetProp, n = "get" + enyo.cap(tp), v;
      v = t[n];
      if (enyo.isFunction(v)) return v.call(t);
      else return t[tp];
    },
    destroy: function () {
      this.source.removeObserver(this.sourceProp, this._sourceResponder);

      // this is ok because it will fail gracefully if it can't find it
      this.target.removeObserver(this.targetProp, this._targetResponder);
      this._targetResponder = null;
      this._sourceResponder = null;
      this.target = null;
      this.source = null;
    },
    to: function (inTarget) {
      this.target = inTarget;
      return this;
    },
    from: function (inSource) {
      this.source = inSource;
      return this;
    },
    oneWay: function () {
      this._oneWay = true; 
      return this;
    },
    twoWay: function () {
      this._oneWay = false;
      return this;
    },
    owner: function () {
      var o = arguments[0];
      if (enyo.isString(o)) o = enyo._getProp(o, false);
      if (!o) throw "enyo._Binding.owner: cannot find owner or no " +
        "owner supplied";
      this._owner = o;
      return this;
    },
    transform: function () {
      var t = arguments[0];
      if (!t || !enyo.isFunction(t))
        throw "enyo._Binding.transform: must supply a valid function";
      this._transform = enyo.bind(this, t);
      return this;
    }
  });

//-----------------------
