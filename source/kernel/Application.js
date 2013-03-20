(function (enyo) {
	
	//*@public
	/**
		In order to provide some convenience and debugging tools we track
		the applications running at any given time. Here we collection them
		for reference later. When _enyo.Application_s are destroyed they know
		to remove themselves from this table.
	*/
	var applications = enyo.applications = {};

	//*@protected
	/**
		Used internally to maintain registration of applications with
		the framework.
	*/
	var register = function (app) {
		applications[app.id] = app;
	};
	
	//*@protected
	/**
		Used internally to unregister applications that have been destroyed.
	*/
	var unregister = function (app) {
		var kind = app.kindName;
		var kinds = applications[kind] || [];
		var idx = kinds.indexOf(app);
		if (!~idx) {
			kinds.splice(idx, 1);
		}
	};
		
	//*@protected
	var _destroy_controllers = function () {
		var name;
		// we iterate over the controllers that are stored in
		// the application hash
		for (name in this.controllers) {
			// we can't know that all of those controllers were placed
			// there by this application or that its owner hasn't been
			// set to something else (owner implying this application
			// instanced the controller and thus is responsible for its
			// life-cycle) so we test for that and destroy it if it is
			if (this === this.controllers[name].owner) {
				if ("function" === typeof this.controllers[name].destroy) {
					this.controllers[name].destroy();
				}
			}
			// regardless of ownership we release the controller reference
			// and hope whoever was responsible for the controller will
			// clean it up
			delete this.controllers[name];
		}
		// remove the reference to the object entirely
		delete this.controllers;
	};
	
	//*@protected
	var _setup_controllers = function () {
		var kinds = this.controllers || [];
		var controllers = this.controllers = {};
		var len = kinds.length;
		var idx = 0;
		var kind;
		for (; idx < len; ++idx) {
			var kind = kinds[idx];
			// we need the name of the instance whether the controller is global
			// or app-specific
			var name = kind.name;
			// there is the optional global flag that indicates if the controller
			// is to be instanced outside the scope of the application
			var global = Boolean(kind.global);
			var ctor;
			var inst;
			// cleanup
			delete kind.global;
			delete kind.name;
			// if the definition does not supply a controller kind we add one
			if (!("kind" in kind)) kind.kind = "enyo.Controller";
			// create a kind constructor for the controller with all of the given
			// properties
			ctor = enyo.kind(kind);
			inst = new ctor({owner: this, app: this});
			// if the controller is not a global controller we create it as part
			// of our applications controller store
			if (false === global) {
				controllers[name] = inst;
			} else {
				enyo.setPath(name, inst);
			}
		}
	};
	
	//*@protected
	enyo.kind.postConstructors.push(function () {
		if (!this._is_application) return;
		
		// now that any controllers for the application have been
		// initialized we test to see if we're supposed to
		// automatically start
		if (true === this.autoStart) this.start();
	});
	
	//*@public
	/**
		An _enyo.Application_ can be used to coordinate execution of
		a given collection of _enyo_ objects. There can be one or more
		_enyo.Applications_ running (with some limitation such as which is
		rendered into the _document.body_ - no limitation if they are each
		rendered into separate DOM nodes or nested). It also provides the
		ability to namespace and automatically initialize any _controllers_
		of the application.
	*/
	enyo.kind({
	
		// ...........................
		// PUBLIC PROPERTIES
		
		//*@public
		name: "enyo.Application",
		
		//*@public
		kind: "enyo.ViewController",
		
		//*@public
		autoStart: true,
		
		//*@public
		renderOnStart: true,
		
		//*@public
		controllers: null,
		
		//*@public
		concat: ["controllers"],
	
		// ...........................
		// PROTECTED PROPERTIES
		
		//*@protected
		_is_application: true,
	
		// ...........................
		// PUBLIC METHODS
		
		//*@public
		/**
			If the _autoStart_ flag is set to true this will automatically
			be executed when the constructor is called. Otherwise it can
			be executed whenever the application should begin execution.
		*/
		start: function () {
			if (true === this.renderOnStart) {
				this.render();
			}
		},
	
		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		constructor: function (props) {
			if (props && enyo.exists(props.name)) {
				enyo.setPath(props.name, this);
				this.id = props.name;
				delete props.name;
			} else {
				this.id = enyo.uid("_application_");
			}
			this.inherited(arguments);
			// we register kind of early in the process in case any controllers
			// or other initialization assumes it will be there...
			register(this);
		},
		
		//*@protected
		constructed: function () {
			// we need to make sure that the controllers are already initialized
			// before we create our view according to the view controller's API
			_setup_controllers.call(this);
			// now we let it continue as usual
			this.inherited(arguments);
		},
		
		//*@protected
		/**
			The overloaded \_create_view method to ensure we supply the
			appropriate values to the new view instance.
		*/
		_create_view: function () {
			// this is the constructor for the view kind
			var ctor = this.get("_view_kind");
			// the properties we want to supply to the view are the
			// app (the reference to this application instance) and the
			// \_bubble_target so events are bubbled to us
			this.set("view", new ctor({app: this, _bubble_target: this}));
		},
		
		//*@protected
		_make_view_name: function () {
			return enyo.uid("_application_view_");
		},
		
		//*@protected
		destroy: function () {
			// release/destroy all controllers associated with
			// this instance of the application
			_destroy_controllers.call(this);
			// do the normal breakdown
			this.inherited(arguments);
			// unregister this as an active application
			unregister(this);
		}

	});
	
}(enyo));
