//*@public
/**
	_enyo.ViewController_ is designed to manage the lifecycle of a particular view
	([enyo.Control](#enyo.Control)) that it owns. It is capable of controlling
	when a view is inserted into the DOM and where, managing events bubbled from
	the view, and isolating (or encapsulating) the entire view hierarchy below it.
	Alternatively, it may be implemented as a component in a larger hierarchy, in
	which case it will inject its view into its parent rather than directly into
	the DOM. And, of course, a ViewController may be used as the _controller_
	property of another view, although this usage will (by default) result in the
	removal of its own view from the [enyo.Component](#enyo.Component) bubbling
	hierarchy.

	Note, _enyo.ViewController_ may have _components_ defined in its `components`
	array but these _components_ should not be _enyo.Controls_.
*/
enyo.kind({
	name: "enyo.ViewController",
	kind: "enyo.Controller",
	/**
		The _view_ property may either be a constructor (or string naming a kind),
		an instance of _enyo.Control_, a string representing the path to an instance
		of _enyo.Control_, an object description of the view (object literal/hash),
		or _null_ if it will be set later. Setting this property to a constructor
		(or string naming a kind) will automatically create an instance of that kind
		according to this controller's settings. If the view is set to an instance,
		it will be rendered according to the properties of the controller. If this
		property is a constructor, it will be preserved in the _viewKind_ property.
		Once initialization is complete, the instance of this controller's view will
		be available via this property.
	*/
	view: null,
	/**
		The preserved kind for this controller's view. You may set this to a
		constructor or a string that resolves to a constructor (or the _view_
		property). In either case, if a view is set explicitly or this property is
		used, the constructor will be available via this property.
	*/
	viewKind: null,
	/**
		Designates where the controller's view will render. This should be a string
		consisting of either _"document.body"_ (the default) or the DOM id of a node
		(either inserted by an _enyo.Control_ or static HTML already in the
		_document.body_). If the controller has a parent (because it was
		instantiated as a component in an _enyo.Control_), this property will be
		ignored and the view will instead be rendered in the parent. This will not
		happen if the controller is a component of _enyo.Component_ or is set as the
		_controller_ property of an _enyo.Control_.
	*/
	renderTarget: "document.body",
	/**
		When the view of the controller has its _destroy()_ method called, it
		automatically triggers its own removal from the controller's _view_
		property. By default, the controller will not create a new _view_ (from
		_viewKind_) automatically unless this flag is set to true (the default is
		false).
	*/
	resetView: false,
	/**
		Renders the controller's view, if possible. If the controller is a component
		of a UiComponent, the view will be rendered into its container; otherwise,
		the view will be rendered into the controller's _renderTarget_. If the view
		is already rendered, this method will do nothing.  If specified, the
		optional _target_ parameter will be used instead of _renderTarget_.
	*/
	render: function (target) {
		var v = this.view,
			t = target || this.renderTarget;
		if (v) {
			if (v.hasNode() && v.generated) { return; }
			// here we test to see if we need to render it into our target node or the container
			if (this.container) {
				v.render();
			} else {
				v.renderInto(enyo.dom.byId(t) || enyo.getPath(t));
			}
		}
	},
	/**
		Renders the view into the requested _target_ and sets the _renderTarget_
		property to _target_.
	*/
	renderInto: function (target) {
		this.render((this.renderTarget=target));
	},
	/**
		Responds to changes in the controller's _view_ property during
		initialization or whenever _set("view", ...)_ is called. If a constructor is
		found, it will be instanced or resolved from a string. If a	previous view
		exists and the controller is its owner, it will be destroyed; otherwise, it
		will simply be removed.
	*/
	viewChanged: function (previous) {
		if (previous) {
			previous.set("bubbleTarget", null);
			if (previous.owner === this && !previous.destroyed) {
				previous.destroy();
			}
			if (previous.destroyed && !this.resetView) {
				return;
			}
		}
		var v = this.view;
		// if it is a string resolve it
		if (typeof v == "string") {
			v = enyo.getPath(v);
		}
		// if it is a function we need to instance it
		if (typeof v == "function") {
			// save the constructor for later
			this.viewKind = v;
			v = null;
		}
		if (typeof this.viewKind == "string") {
			this.viewKind = enyo.getPath(this.viewKind);
		}
		if ((!v && this.viewKind) || (v && typeof v == "object" && !(v instanceof enyo.UiComponent))) {
			var d = (typeof v == "object" && v !== null && !v.destroyed && v) || {kind: this.viewKind},
				s = this;
			// in case it isn't set...
			d.kind = d.kind || this.viewKind || enyo.defaultCtor;
			v = this.createComponent(d, {
				owner: this,
				// if this controller is a component of a UiComponent kind then it
				// will have assigned a container that we can add to the child
				// so it will register as a child and control to be rendered in the
				// correct location
				container: this.container || null,
				bubbleTarget: this
			});
			v.extend({
				destroy: enyo.inherit(function (sup) {
					return function () {
						sup.apply(this, arguments);
						// if the bubble target is the view contorller then we need to
						// let it know we've been destroyed
						if (this.bubbleTarget === s) {
							this.bubbleTarget.set("view", null);
						}
					};
				})
			});
		} else if (v && v instanceof enyo.UiComponent) {
			// make sure we grab the constructor from an instance so we know what kind
			// it was to recreate later if necessary
			if (!this.viewKind) {
				this.viewKind = v.ctor;
			}
			v.set("bubbleTarget", this);
		}
		this.view = v;
	},
	//*@protected
	create: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.viewChanged();
		};
	}),
	destroy: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.view = null;
			this.viewKind = null;
		};
	}),
	/**
		The _controller_ can't be the instance owner of its child view for event propagation
		reasons. This flag being true ensures that events will not be handled multiple times
		by the _controller_ and its _view_ separately.
	*/
	notInstanceOwner: true
});
