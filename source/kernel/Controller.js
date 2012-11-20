enyo.kind({
  name: "enyo.Controller",
  kind: "enyo.Component",
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
	}
});