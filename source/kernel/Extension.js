//*@public
/**
  _enyo.Extension_ aids in exposing third-party/non-Enyo objects
  through an _enyo.Component_. It does this by essentially inheriting
  all 
*/
enyo.kind({
  name: "enyo.Extension",
  kind: "enyo.Component",
  published: {
    extendFrom: null,
    preserve: true,
    preserveAll: false
  },
  _base: null,
  constructor: function () {
    var b = this.extendFrom, from, name;
    if (enyo.isString(b)) b = this._base = enyo.getPath(b);
    if (!b) enyo.error("enyo.Extension: cannot find base to " +
      "extend from "+ this.extendFrom);
    name = this.name || (this.name = this.makeId());
    from = enyo.mixin(b.prototype, {preserve: this.preserve, preserveAll: this.preserveAll, name: name});
    this.extend(from);
    this.inherited(arguments);
    // call the base constructor
    b.apply(this, arguments);
  }
});
