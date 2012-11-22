//*@public
/**
  _enyo.Controller_ is a special type of _enyo.Component_ that is
  not intended for use in a components block (the components array).
*/
enyo.kind({
  name: "enyo.Controller",
  kind: "enyo.Component",
  mixins: ["enyo.MultipleDispatchMixin"],
  published: {
    data: null
  },
  //*@public
  /**
    In cases where a controller needs to proxy content from
    another controller, set this property to a _String_ or
    object reference to an instance of that kind. This could,
    for example, allow a controller of one kind to proxy content
    through another controller with a different implementation
    without the need to share the underlying data directly.
  */
  proxyController: null,
  //*@public
  /**
    Change this to the name of the desired property that is
    bound on this controller from the proxy controller.
  */
  proxyControllerTarget: "data",
  //*@public
  /**
    Change this to the name of the desired property that is
    to be bound from on the proxy controller.
  */
  proxyControllerSource: "data",
  //*@public
  /**
    Set this to true to disable automatic bindings on the proxy
    controller and set your own via the _bindings_ array.
  */
  proxyControllerDisableAutoBindings: false,
	//*@protected
	/**
	  By default _enyo.Controller_ does not wish to bubble events. This is
	  the case for view-owned controllers. Controllers with multiple
	  interested bubble targets are handled separately and incorporate
	  the _enyo.MultipleDispatchMixin_.
	*/
	getBubbleTarget: function () {
	  return null;
	},
	//*@protected
	/**
	  If a view creates an instance of a controller it sets itself as the
	  owner by default. This allows controllers intended to be aware of
	  the view that owns them, to bind on and interact with the owner
	  bidirectionally.
	*/
	ownerChanged: function () {
	  // generate a unique id
	  if (!this.id) this.id = this.makeId();
	  // refresh any bindings we have that target our owner
	  if (this._bindings && this._bindings.length) this.refreshBindings();
	},
	//*@protected
  create: function () {
    this.inherited(arguments);
    this.proxyControllerChanged();
  },
  //*@protected
  proxyControllerChanged: function () {
    this.findAndInstance("proxyController", function (ctor, inst) {
      // if we don't have an instance nothing to do
      if (!inst) return;
      if (ctor) {
        // we should never have a constructor because the proxy controller
        // can only be an instance of a controller not a class
        return enyo.warn("enyo.Controller: cannot use a controller class as a " +
          "proxy controller, must be a controller instance");
      }
      // so we have a proxy controller...
      if (this.proxyControllerDisableAutoBindings) return this.refreshBindings();
      else this.initProxyController();
    });
  },
  //*@protected
  initProxyController: function () {
    var proxy = this.proxyController, target = this.proxyControllerTarget,
        source = this.proxyControllerSource;
    if (!proxy) return;
    this.binding({source: proxy, from: source, to: target});
    proxy.addDispatchTarget(this);
  }
});