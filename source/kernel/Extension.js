//*@public
/**
  _enyo.Extension_ allows a class to extend one or more
  base classes while (optionally) preserving common methods
  of the prototypes. This allows the various methods to be
  called programmatically at runtime or dismissed entirely.
  If you try to extend another _enyo.kind_ it will most likely
  not work as intended.
*/
enyo.kind({
  name: "enyo.Extension",
  kind: "enyo.Component",
  published: {
    // array of hashes that have a property _base_ that is
    // the constructor or string path to the constructor for
    // a class to be inherited from and also the optional
    // _preserve_ and _preserveAll_ options that will be
    // passed to _enyo.Object.extend_
    extendFrom: null,
    
    // properties will be used globally if set to true or
    // false explicitly
    preserve: null,
    preserveAll: null
  },
  constructor: function () {
    this.initSubclasses(arguments);
    this.inherited(arguments);
  },
  //*@protected
  initSubclasses: function () {
    var exts = this.extendFrom || [], fn;
    if (exts && !enyo.isArray(exts)) exts = [exts];
    fn = enyo.bind(this, this.subclass, arguments[0]);
    enyo.forEach(exts, fn);
  },
  //*@protected
  subclass: function (args, options) {
    options = enyo.clone(options);
    var b = this.constructorFrom(options.base), p = b.prototype || {}, t;
    if (b.isMixin) {
      return this.extend(b);
    }
    options.preserve = this.defined(this.preserve, options.preserve);
    options.preserveAll = this.defined(this.preserveAll, options.preserveAll);
    options.name = options.name || p.name || b.name;
    options.id = this.makeId();
    delete options.base;
    this.extend(enyo.mixin(p, options));
    if (!p.kindName) b.apply(this, args);
  },
  //*@protected
  defined: function (override, def) {
    return override === true || override === false? override: def;
  },
  //*@protected
  constructorFrom: function (ctor) {
    return enyo.getPath(ctor);
  }
});
