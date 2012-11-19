(function () {
  
  //*@public
  /**
    TODO: Docs
  */
  enyo.start = function () {
    if (enyo.isRunning) return;
    if (enyo.application) {
      enyo.isRunning = true;
      enyo.application.start();
    } else {
      enyo.warn("No application found, attempting to use default. " +
        "This is a deprecated convention, please see enyo.App");
      if (App) {
        new App().renderInto(document.body);
      } else throw "I can't find anything to run!";
    }
    enyo.flushStartupQueue();
  };
  
  //*@protected
  enyo.startupQueue = [];
  
  //*@public
  /**
    Execute the method (with the optional context) when the framework
    has received the _enyo.start_ command. If the framework has already
    started, the method will be exected immediately, otherwise it will
    be added to a queue and flushed at the appropriate time.
  */
  enyo.run = function (fn, context) {
    var q = enyo.startupQueue || [], args = enyo.toArray(arguments).slice(2);
    if (!fn) return false;
    if (enyo.isString(fn)) {
      fn = enyo.getPath.call(context, fn);
      if (!fn) return false;
    }
    if (!enyo.isFunction(fn)) return false;
    if (enyo.isStarted) {
      return fn.apply(context, args);
    } else {
      q.push(enyo.bind(context, function (fn, args) {
        fn.apply(this, args);
      }, fn, args));
    }
  };
  
  //*@protected
  enyo.flushStartupQueue = function () {
    var q = enyo.startupQueue, fn;
    if (!q) return true;
    while (q && q.length) {
      fn = q.shift();
      if (fn && enyo.isFunction(fn)) fn();
    }
  };
  
  //*@protected
  /**
    Central framework reference to the running application.
  */
  enyo.application = false;
  
  //*@public
  /**
    Creates and returns a reference to the _enyo.Application_ component.
    This component is used internally by the framework. It is assumed that
    there is only _one_ application instance. Accepts a hash of properties,
    _inControl_, that define the root _enyo.Control_ for the application that
    will be rendered when the framework is ready to start. If present, a
    second hash (optional second parameter), _inProps_, may be provided
    and overload the _enyo.Application_ class methods and properties.
    
    TODO: This needs to be extended to be able to show loaders...
  */
  enyo.App = function (inControl, inProps) {
    var ns, n, r, c = inControl || {}, ap = inProps || {};
    n = ap.name || c.name || "app";
    
    // if kinds were defined in the namespace of the application
    // (which they should be, ideally) we preserve them
    ns = enyo.global[n];
    r = (enyo.global[n] = enyo.application = new enyo.Application(c, ap));
    
    // if there were kinds that pre existed our application
    // move those back to the application namespace
    if (ns) for (var k in ns) r[k] = ns[k];
    return r;
  };
  
  
  //*@public
  /**
    _enyo.Application_ has built-in functionality that facilitates the
    framework in properly organizing startup routines, proper application
    namespace, and allows for any classes based off of _enyo.Object_ or
    its subclasses to be loaded out of order.
    
    TODO: Document the other API/features of _enyo.Application_
    TODO: Actually implement the features of _enyo.Application_
  */
  enyo.kind({
    name: "enyo.Application",
    kind: "enyo.UiComponent",
    //*@protected
    constructor: function (inControl) {
      var c = inControl || enyo.defaultRootView;
      if (enyo.isString(c)) c = enyo.getPath(c) || enyo.defaultRootView;
      else if (!enyo.isFunction(c)) c = enyo.kind(enyo.mixin({
        kind: "enyo.Control",
        isRootView: true
      }, c));
      this.rootView = c;
      this.inherited(arguments);
    },
    //*@protected
    constructed: function (inControl, inProps) {
      this.importProps(inProps);
      
      // NOTE: we are deliberately NOT calling create here
    },
    start: function () {
      var r = this.rootView;
      
      // we look for the global main function and if it exists
      // go ahead and fire it
      (function (m) {m()})(window.main || enyo.nop);
      
      // since we overloaded our constructed method, call create now
      this.create();
      
      // setup the root view
      r = this.rootView = new r();
      r.set("owner", this);
      this.addChild(r);
      r.renderInto(document.body);
    }
  });
  
}());