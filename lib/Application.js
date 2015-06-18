require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Application~Application} kind.
* @module enyo/Application
*/

var
	kind = require('./kind'),
	utils = require('./utils'),
	master = require('./master');

var 
	ViewController = require('./ViewController'),
	Controller = require('./Controller');

var 
	applications = {};

/**
* {@link module:enyo/Application~Application} is a type of {@link module:enyo/ViewController~ViewController} that
* encapsulates a collection of [controllers]{@link module:enyo/Controller~Controller} and a
* hierarchy of [controls]{@link module:enyo/Control~Control}. There may be multiple instances
* of an [application]{@link module:enyo/Application~Application} at a given time, with unique
* names and target [DOM nodes]{@glossary Node}. Within a given application, a
* reference to the application is available on all [components]{@link module:enyo/Component~Component}
* via the [app]{@link module:enyo/ApplicationSupport#app} property.
*
* @class Application
* @extends module:enyo/ViewController~ViewController
* @public
*/
exports = module.exports = kind(
	/** @lends module:enyo/Application~Application.prototype */ {
	
	name: 'enyo.Application',
	
	/**
	* @private
	*/
	kind: ViewController,
	
	/**
	* If set to `true` (the default), the [application's]{@link module:enyo/Application~Application}
	* [start()]{@link module:enyo/Application~Application#start} method will automatically be called
	* once its [create()]{@link module:enyo/Application~Application#create} method has completed
	* execution. Set this to `false` if additional setup (or an asynchronous
	* {@glossary event}) is required before starting.
	*
	* @type {Boolean}
	* @default true
	* @public
	*/
	autoStart: true,
	
	/**
	* If set to `true` (the default), the [application]{@link module:enyo/Application~Application} will immediately
	* [render]{@link module:enyo/Application~Application#render} its [view]{@link module:enyo/ViewController~ViewController#view} when
	* the [start()]{@link module:enyo/Application~Application#start} method has completed execution. Set this to
	* `false` to delay rendering if additional setup (or an asynchronous {@glossary event}) is
	* required before rendering.
	*
	* @type {Boolean}
	* @default true
	* @public
	*/
	renderOnStart: true,
	
	/**
	* The `defaultKind` for {@link module:enyo/Application~Application} is {@link module:enyo/Controller~Controller}.
	*
	* @type {Object}
	* @default module:enyo/Controller~Controller
	* @public
	*/
	defaultKind: Controller,

	/**
	* A [bindable]{@link module:enyo/BindingSupport~BindingSupport}, read-only property that indicates whether the
	* [view]{@link module:enyo/ViewController~ViewController#view} has been rendered.
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
	render: kind.inherit(function (sup) {
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
	constructor: kind.inherit(function (sup) {
		return function (props) {
			if (props && typeof props.name == 'string') {
				utils.setPath(props.name, this);
				// since applications are stored by their id's we set it
				// to the name if it exists
				this.id = (props && props.name);
			}
			sup.apply(this, arguments);
			// we alias the `controllers` property to the `$` property to preserve
			// backwards compatibility for the deprecated API for now
			this.controllers = this.$;
			applications[this.id || this.makeId()] = this;
		};
	}),
	
	/**
	* Allows normal creation flow and then executes the application's 
	* [start()]{@link module:enyo/Application~Application#start} method if the
	* [autoStart]{@link module:enyo/Application~Application#autoStart} property is `true`.
	*
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			// ensure that we create() all of the components before continuing
			sup.apply(this, arguments);
			if (this.autoStart) this.start();
			
		};
	}),
	
	/**
	* Ensures that all [components]{@link module:enyo/Component~Component} created by this application have 
	* their [app]{@link module:enyo/ApplicationSupport#app} property set correctly.
	*
	* @method
	* @private
	*/
	adjustComponentProps: kind.inherit(function (sup) {
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
	destroy: kind.inherit(function (sup) {
		return function () {
			delete applications[this.id];
			sup.apply(this, arguments);
		};
	}),
	
	/**
	* Ensures that [events]{@glossary event} bubbling from the views will reach 
	* {@link module:enyo/master} as expected.
	*
	* @private
	*/
	owner: master
});

/**
* Any {@link module:enyo/Application~Application} instances will be available by name from this 
* [object]{@glossary Object}. If no name is provided for an 
* [application]{@link module:enyo/Application~Application}, a name will be generated for it.
*
* @public
* @type {Object}
* @default {}
*/
exports.applications = applications;
