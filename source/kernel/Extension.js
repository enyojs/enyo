enyo.kind({
  name: "enyo.Extension",
  kind: "enyo.Object",
  published: {
    extendFrom: null,
    methods: null,
    target: ""
  },
  _base: null,
  constructor: function () {
    var b = this.extendFrom;
    if (enyo.isString(b)) b = this._base = enyo._getPath(b);
    if (!b) enyo.error("enyo.Extension: cannot find base to " +
      "extend from "+ this.extendFrom);
    
    // we want to make sure we can still _relatively_ conveniently call
    // the original get if we need to
    this._get = function () {return enyo._getPath.apply(this, arguments)};
    this.inherited(arguments);
    this.createProxiedMethods();
  },
  createProxiedMethods: function () {
    
    // this is not a very clean solution to proxying underlying
    // functionality (wrapping) other objects but was fairly
    // convenient for examples - simply name the methods you can
    // safely proxy automatically and have it create those methods
    // on the wrapper and proxy them through...
    
    var m = this._get("methods"), s = this, b = this._base.prototype;
    enyo.forEach(m, function (method) {
      var pm = b[method];
      if (pm && enyo.isFunction(pm))
        s[method] = function () {return b[method].apply(this._get("proxy"), arguments)};
    });
  },
  proxy: enyo.Computed(function () {
    var t = this._get("target");
    return this[t]? this[t]: this;
  }),
  get: function () {
    
    // the overloaded get method will first check for the
    // property on the underlying proxied object - if it is
    // known the property does not exist there call the `._get`
    // method instead
    var p = this._get("proxy"), r;
    r = enyo._getPath.apply(p, arguments);
    if (!r && p !== this) return this._get.apply(this, arguments);
    else return enyo.isFunction(r)? r.call(p): r;
  }
});