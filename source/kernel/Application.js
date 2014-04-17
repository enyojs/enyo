/**
	@namespace enyo
*/
(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var ViewController = enyo.ViewController;
	
	/**
		Any _enyo.Application_ instances will be available by name from this object. If no name is
		provided for an application, a name will be generated for it.
	
		@public
		@memberof enyo
	*/
	enyo.applications = {};
	
	/**
		_enyo.Application_ is a type of {@link enyo.ViewController} that encapsulates a collection
		of {@link enyo.Controller controllers} and a hierarchy of {@link enyo.Control controls}.
		There may be multiple instances of an application at a given time, with unique names and
		target DOM nodes. Within a given application, a reference to the application is available
		on all {@link enyo.Component components} objects via the _app_ property.
	
		@public
		@class enyo.Application
		@extends enyo.ViewController
	*/
	kind(
		/** @lends enyo.Application.prototype */ {
		
		/**
			@private
		*/
		name: 'enyo.Application',
		
		/**
			@private
		*/
		kind: ViewController,
		
		/**
			If set to true (the default), the application's _start()_ method will automatically be
			called once its _create()_ method has completed execution. Set this to false if
			additional setup (or an asynchronous event) is required before starting.
		
			@public
			@default true
			@type {Boolean}
		*/
		autoStart: true,
		
		/**
			If set to true (the default), the application will immediately render its _view_ when
			the _start()_ method has completed execution. Set this to false to delay rendering if
			additional setup (or an asynchronous event) is required before rendering.
		
			@public
			@default true
			@type {Boolean}
		*/
		renderOnStart: true,
		
		/**
			The _defaultKind_ for _enyo.Application_ is _enyo.Controller_.
		
			@public
			@default 'enyo.Controller'
			@type {String}
		*/
		defaultKind: 'enyo.Controller',

		/**
			A bindable, read-only property that indicates whether the view has been rendered.
		
			@public
			@readonly
			@type {Boolean}
		*/
		viewReady: false,
		
		/**
			An abstract method to allow for additional setup to take place after the application has
			completed its initialization and is ready to be rendered. Overload this method to suit
			your app's specific requirements.
		
			@public
			@method
			@returns {this} The callee for chaining.
		*/
		start: function () {
			
			if (this.renderOnStart) this.render();
			return this;
			
		},
		
		/**
			@private
		*/
		render: enyo.inherit(function (sup) {
			
			return function () {
				
				// call the super method render() from ViewController
				sup.apply(this, arguments);
				if (this.view && this.view.generated) this.set('viewReady', true);
				
			};
			
		}),
		
		/**
			@private
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
			Allows normal creation flow and then executes the application's _start()_ method if
			_autoStart_ is true.
		
			@private
		*/
		create: enyo.inherit(function (sup) {
			
			return function () {
				
				// ensure that we create() all of the components before continuing
				sup.apply(this, arguments);
				if (this.autoStart) this.start();
				
			};
			
		}),
		
		/**
			Makes sure that all components created by this application have their _app_ property
			set correctly.
		
			@private
		*/
		adjustComponentProps: enyo.inherit(function (sup) {
			
			return function (props) {
				
				props.app = this;
				sup.apply(this, arguments);
				
			};
			
		}),
		
		/**
			Cleans up the registration for the application.
		
			@private
		*/
		destroy: enyo.inherit(function (sup) {
			
			return function () {
				
				delete enyo.applications[this.id];
				sup.apply(this, arguments);
				
			};
			
		}),
		
		/**
			Ensures that events bubbling from the views will reach _enyo.master_ as expected.
		
			@private
		*/
		owner: enyo.master
	});
	
})(enyo, this);