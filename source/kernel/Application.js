//*@public
/**
	Any _enyo.Application_ instances will be available by name from this object.
	If no name is provided for an application, a name will be generated for it.
*/
enyo.applications = {};
/**
	_enyo.Application_ is a type of [enyo.ViewController](#enyo.ViewController)
	that encapsulates	a collection of [enyo.Controller](#enyo.Controller)s and a
	hierarchy of [enyo.Control](#enyo.Control)s. There may be multiple instances
	of an application at a given time, with unique names and target DOM nodes.
	Within a given application, a reference to the application is available on all
	[enyo.Component](#enyo.Component) objects via the _app_ property.
*/
enyo.kind({
	name: "enyo.Application",
	kind: "enyo.ViewController",
	/**
		If set to true (the default), the application's _start()_ method will
		automatically be called once its _create()_ method has completed execution.
		Set this to false if additional setup (or an asynchronous event) is required
		before starting.
	*/
	autoStart: true,
	/**
		If set to true (the default), the application will immediately render its
		_view_ when the _start()_ method has completed execution. Set this to false
		to delay rendering if additional setup (or an asynchronous event) is
		required before rendering.
	*/
	renderOnStart: true,
	/**
		Set this to an array of _enyo.Controller_ definitions that should be
		instanced for this application. By default, controllers will only be
		available within the scope of the application creating them. Set the
		_global_ flag to true in the definition to use the name of the controller as
		its global identifier. Note that, even if _global: true_ is set on a
		controller, it will be destroyed if the application is destroyed. Once the
		application has completed its _start()_ method, this property will be an
		object comprised of the instances of any controllers described in the
		original array.  These controllers may then be referenced by name.
	*/
	controllers: null,
	/**
		A bindable, read-only property that indicates whether the view has been
		rendered
	*/
	viewReady: false,
	/**
		An abstract method to allow for additional setup to take place after the
		application has completed its initialization and is ready to be rendered.
		Overload this method to suit your app's specific requirements.
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
		Allows normal creation flow and then executes the application's _start()_
		method if _autoStart_ is true.
	*/
	create: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this.autoStart) { this.start(); }
		};
	}),
	/**
		Sets up all controllers for the application, then any other components
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
		Makes sure that all components created by this application have their _app_
		property set correctly.
	*/
	adjustComponentProps: enyo.inherit(function (sup) {
		return function (props) {
			props.app = this;
			sup.apply(this, arguments);
		};
	}),
	/**
		Cleans up the registration for the application.
	*/
	destroy: enyo.inherit(function (sup) {
		return function () {
			delete enyo.applications[this.id];
			sup.apply(this, arguments);
		};
	}),
	/**
		Ensures that events bubbling from the views will reach _enyo.master_ as
		expected.
	*/
	owner: enyo.master,
	statics: {
		concat: function (ctor, props) {
			var p = ctor.prototype || ctor;
			if (props.controllers) {
				p.controllers = (p.controllers? enyo.merge(p.controllers, props.controllers): props.controllers.slice());
				delete props.controllers;
			}
		}
	}
});
