//*@public
/**
	Any _enyo.Application_ instances will be available by name from this object.
	If no name is provided for an application, a name will be generated for it.
*/
enyo.applications = {};
/**
	_enyo.Application_ is a type of [enyo.ViewController](#enyo.ViewController)
	that encapsulates a collection of [enyo.Controller](#enyo.Controller)s and a
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
		The _defaultKind_ for _enyo.Application_ is _enyo.Controller_.
	*/
	defaultKind: "enyo.Controller",
	/**
		## DEPRECATED -- SEE CHANGELOG -- USE _components_ INSTEAD

		Set this to an array of _enyo.Controller_ definitions that should be
		instanced for this application. By default, controllers will only be
		available within the scope of the application creating them. As the property
		exists on _enyo.Controller_, setting the _global_ flag to true in the definition
		will use the name of the controller as its global identifier. Note that if a controller
		is set as _global_ it will not be destroyed if the application is destroyed.
		Once the application has completed its _start()_ method, this property will be a
		reference to the application's _$_ property. These controllers may then be referenced by name.
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
		if (this.renderOnStart) {
			this.render();
		}
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
			// we alias the `controllers` property to the `$` property to preserve
			// backwards compatibility for the deprecated API for now
			this.controllers = this.$;
			enyo.applications[this.id || this.makeId()] = this;
		};
	}),
	/**
		Allows normal creation flow and then executes the application's _start()_
		method if _autoStart_ is true.
	*/
	create: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this.autoStart) {
				this.start();
			}
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
	// TODO-POST-2.3
	// this will no longer be required
	addObserver: enyo.inherit(function (sup) {
		return function (path) {
			var args = arguments;
			if (/^controllers/.test(path)) {
				// throw a warning so developers will know to update their code for future
				// proofing
				this.warn(
					"the `controllers` property is deprecated, please update bindings to instead " +
					"use `$` instead (for path `" + path + "`)"
				);
				// we need to map this property path to '$' instead so it will actually
				// work with observers
				path = path.replace(/^controllers/, "$");
				args = enyo.cloneArray(arguments);
				args[0] = path;
			}
			return sup.apply(this, args);
		};
	}),
	// END-TODO-POST-2.3
	/**
		Ensures that events bubbling from the views will reach _enyo.master_ as
		expected.
	*/
	owner: enyo.master,
	// TODO-POST-2.3
	// there will no longer be a need for this concatenation at all
	statics: {
		concat: function (ctor, props) {
			if (props.controllers) {
				enyo.warn(
					"enyo.Application: the `controllers` property has been deprecated, please " +
					"use the `components` property and update any bindings referencing `controllers` to " +
					"use `$` instead"
				);
				// we merge the controllers with components here to reduce initialization necessary
				// at runtime -- the _controllers_ property should be fully removed in a future release
				props.components = (props.components? props.components.concat(props.controllers): props.controllers.slice());
				delete props.controllers;
			}
		}
	}
	// END-TODO-POST-2.3
});
