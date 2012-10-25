// for now it looks like enyo.Binding cannot inherit from
// enyo.Object since enyo.Object is dependent on enyo.Binding...
(function () {
  
  enyo.bindingCount = 0;
  enyo.bindingsId = 0;
  
  var getParts, copyTransform, getBindingId;
  
  getParts = function (path, context) {
    var o = context? context: this.owner, i, b, bt, p, c, r;
    i = path.lastIndexOf(".");
    //if (i === 0) return {base: o, property: path.slice(1)};
    if (i === 0) r = {base: o, property: path.slice(1)};
    //if (i === -1) return {base: o, property: path};
    if (i === -1) r = {base: o, property: path};
    bt = path.slice(0, i);
    p = path.slice(i + 1);
    if (bt[0] === "." || !(b = enyo._getPath(bt))) b = enyo._getPath.call(o, bt);
    if (b && !b.addObserver) {
      // try to find if the target is a computed property...
      i = bt.lastIndexOf(".");
      c = bt.substring(i+1, bt.length);
      bt = bt.substring(0, i);
      if (bt[0] === "." || !(b = enyo._getPath(bt))) b = enyo._getPath.call(o, bt);
      if (b) {
        if (b[c] && enyo.isFunction(b[c]) && b[c].isProperty) {
          //return {base: b, property: p, computed: c};
          r = {base: b, property: p, computed: c};
        }
      }
    }
    r = r? r: {base: b, property: p};
    if (!r.base) r.base = o;
    return r;
  };
  
  getBindingsId = function () {
    // TODO: possible source of failure?
    return String(enyo.bindingsId++);
  };
  
  copyTransform = function (data) {
    //return enyo.clone(data);
    return data;
  };
  
  function Binding () {
    var args = enyo.toArray(arguments), i = 0;
    for (; i < args.length; ++i) enyo.mixin(this, args[i]);
    enyo.bindingCount++;
    this.bindId = getBindingsId();
    this._setup();
    //console.warn("ADDED A BINDING: ", enyo.bindingCount, this);
  }
   
  Binding.prototype = {
    _target: null,
    _targetProperty: null,
    _targetResponder: null,
    _source: null,
    _sourceProperty: null,
    _sourceResponder: null,
    _sourceComputedProperty: null,
    _waiting: null,
    _setup: function () {
      var s = this._setupSource(), t = this._setupTarget();
      if (!s || !t) return;
      if (this.autoConnect === true) this.connect();
      if (this.autoSync === true) this.sync();
    },
    _setupSource: function () {
      var parts = getParts.call(this, this.from, this.source), b, p, c;
      b = parts.base;
      p = parts.property;
      c = parts.computed;
      //if (!b || (b[p] === undefined && !c)) {
      if (!b) {
        // this case is USUALLY ok because it means that a binding was
        // created BEFORE one the the source/target was not available yet
        // but the object will attempt again at a more appropriate time
        // this is an unfortunate by-product of the inheritance chain
        return false;
      }
      this._source = b;
      this._sourceProperty = p;
      this._sourceComputedProperty = c;
      return true;
    },
    _setupTarget: function () {
      var parts = getParts.call(this, this.to, this.target), b, p;
      b = parts.base;
      p = parts.property;
      if (!b) {
        return false;
      }
      this._target = b;
      this._targetProperty = p;
      return true;
    },
    _connectSource: function () {
      var s = this._source, sp = this._sourceProperty, sr = this._sourceResponder,
        sc = this._sourceComputedProperty;
        
      if (!sr || !enyo.isFunction(sr)) {
        sr = this._sourceResponder = enyo.bind(this, this._syncFromSource);
      }
      
      if (!s) {
        // TODO: this needs to be monitored because the case where it showed up
        // was "ok" but there are probably times when this indicates a problem
        // NOTE: it was occuring when a row of a list-element was directly bound
        // to a property of its controller, a status change would take place, and
        // the list would re-render which destroys the view and the controller
        // and any observers/bindings but apparently the observer would fire anyways
        // and attempt to sync...
        return false;
      }
      
      sr.bindId = this.bindId;
      var o = sr;
      
      // if it is a computed property it can only be one way!
      if (sc) this.oneWay = true;
      s.addObserver(sc || sp, sr);
    },
    _connectTarget: function () {
      var t = this._target, tp = this._targetProperty, tr = this._targetResponder;
      if (this.oneWay === true) return;
      if (!tr || !enyo.isFunction(tr)) {
        tr = this._targetResponder = enyo.bind(this, this._syncFromTarget);
      }
      
      tr.bindId = this.bindId;
      
      t.addObserver(tp, tr);
    },
    
    // TODO: the following only works because observer notification has
    // been implemented as synchronously executed, it also creates
    // significant overhead that may/may-not be necessary if other pieces
    // of the puzzle are added
    
    // NOTE: two-way bindings without an arbitrary runloop AND/OR while
    // depending on the notification of registered observers is a complete
    // PITA!!!
    
    _syncFromSource: function () {
      if (!this.oneWay) this._disconnectTarget();
      this.setTargetValue(this.getSourceValue());
      if (!this.oneWay) this._connectTarget();
    },
    _syncFromTarget: function () {
      this._disconnectSource();
      this.setSourceValue(this.getTargetValue());
      this._connectSource();
    },
    
    isConnected: false,
    isSynced: false,
    to: null,
    from: null,
    target: null,
    source: null,
    owner: null,
    autoConnect: false,
    autoSync: true,
    transform: null,
    oneWay: false,
    allowRefresh: true,
    
    sync: function (force) {
      if (this.isSynced && force !== true) return;
      this._syncFromSource();
      this.isSynced = true;
      return;
    },
    
    refresh: function () {
      if (!this.allowRefresh) return false;
      this.disconnect();
      this._setup();
    },
    
    connect: function () {
      if (this.isConnected) return;
      this._connectSource();
      this._connectTarget();
      this.isConnected = true;
    },
    
    disconnect: function () {
      this._disconnectSource();
      this._disconnectTarget();
      this.isSynced = false;
      this.isConnected = false;
    },
    
    _disconnectSource: function () {
      var sp = this._sourceProperty, sc = this._sourceComputedProperty;
      if (!this._source) return;
      this._source.removeObserver(sc || sp, this._sourceResponder);
    },
    
    _disconnectTarget: function () {
      if (!this._target) return;
      this._target.removeObserver(this._targetProperty, this._targetResponder);
    },
    
    suspend: function () {
      
    },
    
    getTargetValue: function () {
      //var r = enyo._getPath.call(this._target, this._targetProperty);
      
      if (!this._target) {
        enyo.error("no target", this);
      }
      
      var r = this._target.get(this._targetProperty);
      if (r instanceof Object) r = copyTransform(r);
      return r;
    },
    
    setTargetValue: function (inValue) {
      var v = this.transform && enyo.isFunction(this.transform)? this.transform(inValue, "target"): inValue;
      this.isSynced = true;
      return this._target.set(this._targetProperty, v);
    },
    
    getSourceValue: function () {
      var r, sp = this._sourceProperty, sc = this._sourceComputedProperty;
      //if (sc) r = enyo._getPath.call(this._source, sc)[sp];
      //else r = enyo._getPath.call(this._source, this._sourceProperty);
      if (sc) r = this._source.get(sc)[sp];
      else r = this._source.get(this._sourceProperty);
      if (r instanceof Object) r = copyTransform(r);
      return r;
    },
    
    setSourceValue: function (inValue) {
      var v = this.transform && enyo.isFunction(this.transform)? this.transform(inValue, "source"): inValue;
      return this._source.set(this._sourceProperty, v);
    },
    
    destroy: function () {
      this.disconnect();
      this._source = null;
      this._target = null;
      this._sourceResponder = null;
      this._targetResponder = null;
      this.isDestroyed = true;
      enyo.bindingCount--;
      
      if (this.owner) {
        this.owner.removeBinding(this);
      }
      //console.log("REMOVED A BINDING: ", enyo.bindingCount);
    }
  };
  
  enyo.Binding = Binding;
  
}());