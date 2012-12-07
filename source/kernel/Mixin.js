(function () {
  
  //*@public
  /**
  */
  enyo.Mixin = function (inProps, inConfig) {
    return (new _Mixin(inProps, inConfig));
  };
  
  //*@protected
  function _Mixin (inProps, inConfig) {
    var p = enyo.mixin(enyo.Mixin.detaults, (inProps || {})),
        c = enyo.mixin(enyo.Mixin.defaultCongif, (inConfig || {})),
        name = p.name || enyo.Mixin.generateId();
    this.name = name;
    this.properties = enyo.union(enyo.Mixin.ignore, enyo.keys(p));
    enyo.mixin(this, c);
    enyo.mixin(this, p);
    if (this.autoInit && this.target) this.apply();
    else this.autoInit = false;
    enyo.Mixin.mixins[name] = this;
    if (!enyo.getPath(name)) enyo.setPath(name, this);
  }
  
  enyo.Mixin.deftaults = {
    destroyMixin: null
  };
  
  enyo.Mixin.defaultConfig = {
    autoInit: true,
    target: null,
    initMixin: enyo.nop
  };
  
  enyo.Mixin.counter = 0;
  
  enyo.Mixin.mixins = {};
  
  enyo.Mixin.ignore = ["name", "initMixin", "destroyMixin"];
  
  enyo.Mixin.getMixin = function (inName) {
    return enyo.Mixin.mixins[inName];
  };
  
  enyo.Mixin.generateId = function () {
    return "@@" + (this.counter++) + "_Mixin";
  };
  
  _Mixin.prototype = {
    isMixin: true,
    apply: function (inTarget) {
      var t = inTarget || this.target;
      if (!(t instanceof enyo.Object))
        return enyo.warn("enyo.Mixin: cannot apply mixin to non-object");
      this.target = t; // this is here for a reason!
      // extend the object by the appropriate methods and properties
      t.extend(this.get("extension"));
      if (this.destroyMixin && enyo.isFunction(this.destroyMixin)) {
        this.injectDestroy();
      }
      if (this.initMixin) this.initMixin.call(t);
      (function (a, m) {a.push(m.name)})((t._mixins || (t._mixins = [])), this);
      this.target = null;
    },
    injectDestroy: function () {
      var t = this.target, base, d = this.destroyMixin;
      if ((base = t.destroy)) {
        d = t.destroy = enyo.bind(t, d);
        d._inherited = base;
      } else t.destroy = d;
    },
    extension: enyo.Computed(function () {
      var r = {}, p = this.properties;
      enyo.forEach(p, function (prop) {
        r[prop] = this[prop];
      }, this);
      return r;
    }),
    get: function () {
      return enyo.getPath.apply(this, arguments);
    }
  }
 
}());