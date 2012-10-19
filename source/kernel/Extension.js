enyo.kind({
  name: "enyo.Extension",
  kind: "enyo.Object",
  published: {
    extendFrom: null
  },
  _base: null,
  constructor: function () {
    var b = this.extendFrom;
    if (enyo.isString(b)) b = this._base = enyo._getPath(b);
    if (!b) enyo.error("enyo.Extension: cannot find base to " +
      "extend from "+ this.extendFrom);
    
    this.extend(b.prototype);
    
    // TODO: this needs to be reconsidered as a fallback, it may/may not
    // be obvious nor convenient to automatically call the _stored `get`
    // on extensions and only call the native get if it failed...could
    // always call published getters...
    this._get = function () {return enyo._getPath.apply(this, arguments)};
    this.inherited(arguments);

    b.apply(this, arguments);
  },

  get: function () {
    var r;
    if (this._stored && this._stored.get) {
      r = this._stored.get.apply(this, arguments);
    }
    if (r === undefined) {
      r = this.inherited(arguments);
      return r;
    } else return r;
  }

});