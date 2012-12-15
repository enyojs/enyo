(function () {
  
  //*@public
  /**
    An _enyo.Binding_ is a versatile object that creates an
    automatic propagation of changes between properties of
    a designated source or sources. Typically this object is
    exercised by a helper from _enyo.Object_ but can be
    instantiated independently if care is used to release
    object references and prevent memory leaks.
    
    TODO: complete docs
  */
  enyo.Binding = Binding;
  
  //*@protected
  function Binding () {
    var args = enyo.toArray(arguments), i = 0;
    for (; i < args.length; ++i) enyo.mixin(this, args[i]);
    enyo.bindingCount++;
    this.bindId = getBindingsId();
    this._setup();
  }
  
  enyo.bindingCount = 0;
  enyo.bindingsId = 0;
  
  var getParts, copyTransform, getBindingId;
  
  //*@protected
  /**
    The goal of this _enyo.Binding_ secure method is to
    take a given path (relative to optional _context_ which
    defaults to the _enyo.Binding_ _owner_ property if not
    provided in the definition), determine the object reference
    and the property on that reference as well as whether or
    not the target property is a _enyo.Computed_ property.
  */
  getParts = function (path, context) {
    // goal is to split the path and iterate over the parts
    // analyzing each piece until we reach the end
    path = path[0] === "."? path.slice(1): path;
    var parts = path.split("."), idx = 0, ret = {}, root, cur, prop, base, part;
    // the root is either the context passed in or the owner
    // of this method's caller
    root = context || (function (root) {return root[parts[0]]? root: undefined})(enyo.global) || this.owner;
    // initial starting place for the cur pointer
    base = root;
    // the property is assumed to be the last part of path
    // (or the entire path if no '.' is found)
    ret.property = prop = parts.length > 1? parts.pop(): path;
    if (prop === path) {
      ret.base = base;
    } else {
      for (; idx < parts.length; ++idx) {
        part = parts[idx];
        if (!part) continue;
        // update pointer
        cur = base[part];
        // if we can't find part of the path 
        if (!cur || "string" === typeof cur) {
            if (part !== prop) {
                ret.base = null;
            }
            return ret;
        }
        // update base pointer
        if (part !== path) base = cur;
        ret.base = base;
      }
    }
    return ret;
  };
  
  getBindingsId = function () {
    // TODO: possible source of failure?
    return String(enyo.bindingsId++);
  };
  
  copyTransform = function (data) {
    //return enyo.clone(data);
    return data;
  };
   
  Binding.prototype = {
    _target: null,
    _targetProperty: null,
    _targetResponder: null,
    _source: null,
    _sourceProperty: null,
    _sourceResponder: null,
    _waiting: null,
    _setup: function () {
      var s = this._setupSource(), t = this._setupTarget();
      if (!s || !t) return;
      if (this.autoConnect === true) this.connect();
      if (this.autoSync === true) this.sync();
    },
    _setupSource: function () {
      var parts = getParts.call(this, this.from, this.source), b, p;
      b = parts.base;
      p = parts.property;
      if (!b) {
        // this case is USUALLY ok because it means that a binding was
        // created BEFORE one the the source/target was not available yet
        // but the object will attempt again at a more appropriate time
        // this is an unfortunate by-product of the inheritance chain
        return false;
      }
      this._source = b;
      this._sourceProperty = p;
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
      var s = this._source, sp = this._sourceProperty, sr = this._sourceResponder;
        
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
      
      s.addObserver(sp, sr);
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
    oneWay: true,
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
      //var r = enyo.getPath.call(this._target, this._targetProperty);
      
      if (!this._target) {
        enyo.error("no target", this);
      }
      
      var r = this._target.get(this._targetProperty);
      if (r instanceof Object) r = copyTransform(r);
      return r;
    },
    
    setTargetValue: function (value) {
      //var v = this.transform && enyo.isFunction(this.transform)? this.transform(inValue, "target"): inValue;
      //this.isSynced = true;
      //return this._target.set(this._targetProperty, v, enyo.isArray(v));
      this.isSynced = true;
      return this._target.set(this._targetProperty, this._transform(value, "target"), enyo.isArray(value));
    },
    
    _transform: function (value, direction) {
      var trans = this.transform;
      if (trans === undefined || trans === null) return value;
      else if ("string" === typeof trans) {
        trans = (this.owner && this.owner[trans]) || enyo.getPath(trans);
        if (trans && "function" === typeof trans) return trans(value, direction);
      } else if ("function" === typeof trans) return trans(value, direction);
      else {
        enyo.warn("enyo.Binding: invalid transform applied to binding");
        return value;
      }
    },
    
    getSourceValue: function () {
      var r, sp = this._sourceProperty, sc = this._sourceComputedProperty;
      //if (sc) r = enyo.getPath.call(this._source, sc)[sp];
      //else r = enyo.getPath.call(this._source, this._sourceProperty);
      if (sc) r = this._source.get(sc)[sp];
      else r = this._source.get(this._sourceProperty);
      if (r instanceof Object) r = copyTransform(r);
      return r;
    },
    
    setSourceValue: function (value) {
      //var v = this.transform && enyo.isFunction(this.transform)? this.transform(inValue, "source"): inValue;
      return this._source.set(this._sourceProperty, this._transform(value, "source"));
      //return this._source.set(this._sourceProperty, v);
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
  
}());
