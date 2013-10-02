//*@public
/**
	Any _enyo.Applications_ will be available by _name_ from this object.
	If no _name_ is provided for an _application_ a name will be generated
	for it.
*/
enyo.applications = {};
/**
	An _enyo.Application_ is a type of _enyo.ViewController_ that encapsulates
	a collection of _enyo.Controllers_ and a hierarchy of _enyo.Controls_. There
	can be multiple instances of an _application_ at a time with unique names and
	target DOM nodes. A reference to an _application_ is available on all _enyo.Components_
	within an _application_ via the `app` property.
*/
enyo.kind({
	name: "enyo.Application",
	kind: "enyo.ViewController",
	noDefer: true,
	/**
		If set to `true` (defaults to `true`) will automatically call the `start`
		method of the _application_ once its `create` method has completed executing.
		Set this to `false` if there is additional setup or an asynchronous event
		requried before starting.
	*/
	autoStart: true,
	/**
		If set to `true` (defaults to `true`) will immediately render the `view`
		when the `start` method has completed execution. Set this to `false` to delay
		rendering if additional setup is required or an asycnhronous event required
		before rendering.
	*/
	renderOnStart: true,
	/**
		Set this to an array of _enyo.Controller_ definitions that should be instanced
		for this _application_. By default _controllers_ will only be available within
		the scope of the _application_ creating them. Set the `global` flag to `true` in
		the definition to have the `name` of the _controller_ used as its _global_ identifier.
		Even if a _controller_ is set to _global_ it will be destroyed if the _application_ is
		destroyed. Once the _application_ has completed its `start` method this property will be an
		object comprised of the instances of any _controllers_ described in the original array.
		They are referenceable by their `name`.
	*/
	controllers: null,
	/**
		A bindable, read-only property that indicates when the `view` has been rendered.
	*/
	viewReady: false,
	/**
		An abstraction method to allow for additional setup to take place after the _application_
		has completed its initialization and ready to be rendered. Overload this method for
		implementation specific requirements.
	*/
	start: function () {
		if (this.renderOnStart) { this.render(); }
	},
	//*@protected
	render: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this.view && this.view.generated) {
				this.set("viewReady", true);
			}
		};
	}),
	constructor: enyo.inherit(function (sup) {
		return function (props) {
			if (props && typeof props.name == "string") {
				enyo.setPath(props.name, this);
				// since applications are stored by their id's we set it
				// to the name if it exists
				this.id = (props && props.name);
			}
			sup.apply(this, arguments);
			enyo.applications[this.id] = this;
		};
	}),
	/**
		Allows normal creation flow and then executes the _applications_ `start`
		method if `autoStart` is `true`.
	*/
	create: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this.autoStart) { this.start(); }
		};
	}),
	/**
		Setup all controllers for the application then the rest of any components
		defined for the kind.
	*/
	initComponents: enyo.inherit(function (sup) {
		return function () {
			// the original array of controller definitions (if any)
			var cc = this.controllers,
			// reassign the controllers property to the object even if we don't
			// wind up having any
				co = (this.controllers={});
			if (cc) {
				for (var i=0, c; (c=cc[i]); ++i) {
					c.kind == c.kind || "enyo.Controller";
					c = this.createComponent(c, {owner: this});
					// the controller will accessible inside the '$' hash or the
					// 'controllers' hash for binding purposes (and backwards compatibility)
					co[c.name] = c;
					if (c.global) { enyo.setPath(c.name, c); }
				}
			}
			// now do the rest
			sup.apply(this, arguments);
		};
	}),
	/**
		Make sure that all components created by this _application_ have their
		`app` property set correctly.
	*/
	adjustComponentProps: enyo.inherit(function (sup) {
		return function (props) {
			props.app = this;
			sup.apply(this, arguments);
		};
	}),
	/**
		Make sure to cleanup the registration for the _application_.
	*/
	destroy: enyo.inherit(function (sup) {
		return function () {
			delete enyo.applications[this.id];
			sup.apply(this, arguments);
		};
	}),
	/**
		Ensure that events bubble from the views will reach _enyo.Master_ as expected.
	*/
	owner: enyo.master
});

//*@protected
enyo.Application.concat = function (ctor, props) {
	var p = ctor.prototype || ctor;
	if (props.controllers) {
		p.controllers = (p.controllers? enyo.merge(p.controllers, props.controllers): props.controllers.slice());
		delete props.controllers;
	}
};
