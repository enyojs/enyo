(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var ViewController = enyo.ViewController;
	
	/**
	* Any {@link enyo.Application} instances will be available by name from this 
	* [object]{@glossary Object}. If no name is provided for an 
	* [application]{@link enyo.Application}, a name will be generated for it.
	*
	* @public
	*/
	enyo.applications = {};
	
	/**
	* {@link enyo.Application} is a type of {@link enyo.ViewController} that
	* encapsulates a collection of [controllers]{@link enyo.Controller} and a
	* hierarchy of [controls]{@link enyo.Control}. There may be multiple instances
	* of an [application]{@link enyo.Application} at a given time, with unique
	* names and target [DOM nodes]{@glossary Node}. Within a given application, a
	* reference to the application is available on all [components]{@link enyo.Component}
	* via the [app]{@link enyo.ApplicationSupport#app} property.
	*
	* @class enyo.Application
	* @extends enyo.ViewController
	* @public
	*/
	kind(
		/** @lends enyo.Application.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.Application',
		
		/**
		* @private
		*/
		kind: ViewController,
		
		/**
		* If set to `true` (the default), the [application's]{@link enyo.Application}
		* [start()]{@link enyo.Application#start} method will automatically be called
		* once its [create()]{@link enyo.Application#create} method has completed
		* execution. Set this to `false` if additional setup (or an asynchronous
		* {@glossary event}) is required before starting.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		autoStart: true,
		
		/**
		* If set to `true` (the default), the [application]{@link enyo.Application} will immediately
		* [render]{@link enyo.Application#render} its [view]{@link enyo.ViewController#view} when
		* the [start()]{@link enyo.Application#start} method has completed execution. Set this to
		* `false` to delay rendering if additional setup (or an asynchronous {@glossary event}) is
		* required before rendering.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		renderOnStart: true,
		
		/**
		* The `defaultKind` for {@link enyo.Application} is {@link enyo.Controller}.
		*
		* @type {String}
		* @default 'enyo.Controller'
		* @public
		*/
		defaultKind: 'enyo.Controller',

		/**
		* A [bindable]{@link enyo.BindingSupport}, read-only property that indicates whether the 
		* [view]{@link enyo.ViewController#view} has been rendered.
		*
		* @readonly
		* @type {Boolean}
		* @default false
		* @public
		*/
		viewReady: false,
		
		/**
		* An abstract method to allow for additional setup to take place after the application has
		* completed its initialization and is ready to be rendered. Overload this method to suit
		* your app's specific requirements.
		*
		* @returns {this} The callee for chaining.
		* @public
		*/
		start: function () {
			if (this.renderOnStart) this.render();
			return this;
		},
		
		/**
		* @method
		* @private
		*/
		render: enyo.inherit(function (sup) {
			return function () {
				// call the super method render() from ViewController
				sup.apply(this, arguments);
				if (this.view && this.view.generated) this.set('viewReady', true);
			};
		}),
		
		/**
		* @method
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function (props) {
				if (props && typeof props.name == 'string') {
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
		* Allows normal creation flow and then executes the application's 
		* [start()]{@link enyo.Application#start} method if the
		* [autoStart]{@link enyo.Application#autoStart} property is `true`.
		*
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
				// ensure that we create() all of the components before continuing
				sup.apply(this, arguments);
				if (this.autoStart) this.start();
				
			};
		}),
		
		/**
		* Ensures that all [components]{@link enyo.Component} created by this application have 
		* their [app]{@link enyo.ApplicationSupport#app} property set correctly.
		*
		* @method
		* @private
		*/
		adjustComponentProps: enyo.inherit(function (sup) {
			return function (props) {
				props.app = this;
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* Cleans up the registration for the application.
		*
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				delete enyo.applications[this.id];
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* Ensures that [events]{@glossary event} bubbling from the views will reach 
		* {@link enyo.master} as expected.
		*
		* @private
		*/
		owner: enyo.master
	});
	
})(enyo, this);