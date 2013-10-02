//*@public
/**
	The _enyo.ViewController_ is designed to manage the lifecycle of a
	particular _view_ (enyo.Control) that it owns. It has the capability of
	being used to control when a _view_ is inserted into the DOM, where, manage
	events bubbled from the _view_, and isolate (or encapsulate) the entire _view_
	hierarchy below it. In other use-cases it could be implemented as a _component_
	in a larger hierarchy and instead of injecting its _view_ into the DOM directly
	will insert it into its _parent_. Of course it can also be used on the _controller_
	property of another _view_ although this would remove its own _view_ from the
	_enyo.Component_ bubbling hierarchy (by default).
*/
enyo.kind({
	name: "enyo.ViewController",
	kind: "enyo.Controller",
	/**
		The `view` property can either be a constructor (or string naming a _kind_), an
		instance of _enyo.Control_, a string representing the path to an instance of
		_enyo.Control_, or null if it will be set later. Setting this property to a constructor
		(or a string naming a _kind_) when active will automatically create an instance of
		that kind according to any of the settings for this _controller_. If the _view_ is set
		as an instance it will be rendered according to the properties of the _controller_.
		If this property is a constructor it will be preserved in the `viewKind` property.
		Once initialization is complete, the instance of this _controller's_ _view_ will be available
		via this property.
	*/
	view: null,
	/**
		This is the preserved _kind_ for the `view` of this _controller_. You can set this to a constructor
		or a string that is resolved to a constructor (or the `view` property). Either way, if a `view` is
		set explicitly or this property was used the constructor will be available at this property.
	*/
	viewKind: null,
	/**
		This property will designate where the _controller's_ _view_ will render. This should be a string
		of either `document.body` or the DOM `id` of a node (either inserted by an _enyo.Control_ or
		static HTML already in the `document.body`). If the _controller_ has a `parent` (because it was
		instantiated as a _component_ in an _enyo.Control_) this property will be ignored and the _view_
		will instead be rendered in the `parent`. This would not happen if the _controller_ is a _component_
		of _enyo.Component_ or is set as the `controller` property of an _enyo.Control_. The default is
		`document.body`.
	*/
	renderTarget: "document.body",
	/**
		If possible, will render its `view`. If the _controller_ is a component of a UiComponent the
		`view` will be rendered into its `container`, otherwise the `view` will be rendered into the
		`renderTarget` of the _controller_. If the `view` is already rendered this will do nothing.
		Optional target will be used instead of `renderTarget`.
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
		Will render the `view` into the requested _target_ and set the `renderTarget`
		property to _target_.
	*/
	renderInto: function (target) {
		this.render((this.renderTarget=target));
	},
	/**
		Responds to changes of the `view` property of the _controller_ during initialization or whenever
		`set("view", ...)` is called. If a constructor is found it will be instanced or resolved from a string.
		If there was a previous `view` already and the _controller_ is the `owner` it will be destroyed otherwise
		simply removed.
	*/
	viewChanged: function (previous) {
		if (previous) {
			previous.set("bubbleTarget", null);
			if (previous.owner === this) { previous.destroy(); }
		}
		var v = this.view;
		// if it is a string resolve it
		if (typeof v == "string") { v = enyo.getPath(v); }
		// if it is a function we need to instance it
		if (typeof v == "function") {
			// save the constructor for later
			this.viewKind = v;
			v = null;
		}
		if (typeof this.viewKind == "string") {
			this.viewKind = enyo.getPath(this.viewKind);
		}
		if ((!v && this.viewKind) || (v && typeof v == "object")) {
			var d = (typeof v == "object" && v) || {kind: this.viewKind};
			// in case it isn't set...
			d.kind = d.kind || this.viewKind;
			v = this.createComponent(d, {
				owner: this,
				// if this controller is a component of a UiComponent kind then it
				// will have assigned a `container` that we can add to the child
				// so it will register as a child and control to be rendered in the
				// correct location
				container: this.container || null,
				bubbleTarget: this
			});
		} else {
			// make sure we grab the constructor from an instance so we know what kind
			// it was to recreate later if necessary
			if (!this.viewKind) { this.viewKind = v.ctor; }
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
	})
});
