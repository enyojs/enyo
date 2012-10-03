(function () {
  
  // initialize the global app reference
  enyo._app = null;
  
  enyo.app = function (inProps) {
    var n = enyo.global[inProps.name], r;
    r = (enyo.global[inProps.name] = new enyo.Application(inProps));
    if (n) for (var p in n) r[p] = n[p];
    return r;
  };
  
  enyo.kind({
    name: "enyo.Application",
    kind: "enyo.Control",
    published: {
      store: false,
      router: false,
      controller: null
    },
    constructor: function (inProps) {
      var c = inProps.classes || "";
      c = inProps.name.toLowerCase() + "-app" + c;
      inProps.classes = c;
      enyo.mixin(this, inProps);
      this.inherited(arguments);
      enyo._app = this;
    },
    create: function () {
      
      // this is an ugly hack that MUST BE RETHOUGHT OUT
      // but its necessary to move the normal create method
      // order until AFTER the `main` method is called...
      this._createArguments = arguments;
    },
    start: function () {
      if (this.main && enyo.isFunction(this.main)) this.main();
      
      // ...and...resume normal create method...
      this.inherited(this._createArguments);
      this.setup();
      this.renderInto(document.body);
      if (this.router) this.router.start();
    },
    setup: function () {
      this.setupAppController();
      this.setupRouter();
    },
    setupAppController: function () {
      var c = this.controller;
      if (enyo.isString(c)) c = enyo._getPath(c);
      if (!c) return (this.controller = this);
      c = this.controller = new c();
      c.set("owner", this);
    },
    setupRouter: function () {
      var r = this.router, c = this.controller;
      if (enyo.isString(r)) r = enyo._getPath(r);
      if (!r) return console.warn("enyo.Application: could not " +
        "find the router `" + this.router + "`");
      r = this.router = new r();
      r.set("controller", c);
    },
    dispatchEvent: function () {
      this.controller.handle.apply(this.controller, arguments);
    },
    handle: function () {
      return enyo._handle.apply(this, arguments);
    }
  });
  
}());