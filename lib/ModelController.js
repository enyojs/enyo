require('enyo');

/**
* Contains the declaration for the {@link module:enyo/ModelController~ModelController} kind.
* @module enyo/ModelController
*/

var
	kind = require('./kind'),
	utils = require('./utils');

var
	ProxyObject = require('./ProxyObject'),
	Component = require('./Component'),
	ComputedSupport = require('./ComputedSupport'),
	EventEmitter = require('./EventEmitter'),
	CoreObject = require('./CoreObject');

/**
* Only necessary because of the order in which mixins are applied.
*
* @class
* @private
*/
var BaseModelController = kind({
	kind: Component,
	mixins: [ComputedSupport, EventEmitter, ProxyObject]
});

/**
* A controller designed to proxy an underlying {@link module:enyo/Model~Model}. Other
* [kinds]{@glossary kind} may [bind]{@link module:enyo/BindingSupport~BindingSupport} to this
* controller as if it were an `enyo.Model`. Using the
* [model]{@link module:enyo/ModelController~ModelController#model} reserved property, the actual model
* may be changed without the bindings' needing to know. It will also propagate
* events [emitted]{@link module:enyo/EventEmitter~EventEmitter#emit} by the underlying model.
* 
* It is important to note that `"model"` is a reserved property name. Also
* note that bindings should **never** bind through the controller to the model
* directly.
* 
* **Rules of property resolution**
*
* If the controller can call [hasOwnProperty()]{@glossary Object.hasOwnProperty}
* and it returns `true`, it will look locally; if the property is resolved to
* be a computed property, the requested property will be proxied from the given
* model, when available.
* 
* @class ModelController
* @extends module:enyo/Component~Component
* @mixes module:enyo/ComputedSupport~ComputedSupport
* @mixes module:enyo/EventEmitter~EventEmitter
* @mixes module:enyo/ProxyObject~ProxyObject
* @public
*/
module.exports = kind(
	/** @lends module:enyo/ModelController~ModelController.prototype */ {
	
	name: 'enyo.ModelController',
	
	/**
	* @private
	*/
	kind: BaseModelController,
	
	/**
	* The {@link module:enyo/Model~Model} to proxy. If this is set to an instance of `enyo.Model`,
	* the [controller]{@link module:enyo/ModelController~ModelController} will propagate `enyo.Model`
	* [events]{@glossary event} and [notifications]{@link module:enyo/ObserverSupport~ObserverSupport.notify}.
	* **No bindings should ever bind directly to attributes of this property.**
	*
	* Also note that this is a reserved property name and will collide with any
	* [attribute]{@link module:enyo/Model~Model#attributes} named `"model"`. This scenario should
	* be avoided.
	*
	* @type module:enyo/Model~Model
	* @default null
	* @public
	*/
	model: null,
	
	/**
	* @private
	*/
	proxyObjectKey: 'model',
	
	/**
	* @method
	* @private
	*/
	get: kind.inherit(function (sup) {
		return function (path) {
			
			if (this.hasOwnProperty(path) || this.isComputed(path)) {
				return this._getComputed(path);
			}
			
			return sup.apply(this, arguments);
		};
	}),
	
	/**
	* @method
	* @private
	*/
	set: kind.inherit(function (sup) {
		return function (path) {
			
			if (typeof path == 'string') {
				if (this.hasOwnProperty(path)) {
					return this.isComputed(path) ? this : utils.setPath.apply(this, arguments);
				}
			}
			
			return sup.apply(this, arguments);
		};
	}),
	
	/**
	* @method
	* @private
	*/
	_getComputed: ComputedSupport.get.fn(CoreObject.prototype.get),
	
	/**
	* @type enyo.ObserverSupport~Observer
	* @private
	*/
	modelChanged: function (was, is, path) {
		// unregister previous model if any
		if (was) was.off('*', this._modelEvent, this);
		// register for events on new model if any
		if (is) is.on('*', this._modelEvent, this);
		
		// either way we need to update any observers that might be related
		// to the model
		var props = this.modelObservedProperties();
		for (var key in props) {
			if ((!was && is) || (was && !is) || (was && is && was.attributes[key] !== is.attributes[key])) {
				this.notify(key, was && was.get(key), is && is.get(key));
			}
		}
		
		this.emit('model', {was: was, is: is});
	},
	
	/**
	* @method
	* @private
	*/
	_modelEvent: function (model, e, props) {
		// re-emit the event as expected with the only change being the originator (first param)
		// will be this controller but all listeners should expect to use the third parameter as
		// is the convention for model listeners
		this.emit(e, props, model);
		
		switch (e) {
		case 'change':
			if (props) for (var key in props) this.notify(key, model.previous[key], props[key]);
			break;
		case 'destroy':
			this.set('model', null);
			break;
		}
	},
	
	/**
	* @method
	* @private
	*/
	modelObservedProperties: function () {
		return this._observedProps || (this._observedProps = {});
	},
	
	/**
	* @method
	* @private
	*/
	observe: kind.inherit(function (sup) {
		return function (path) {
			var part = path
				, parts;
			
			if (path.indexOf('.') > -1) {
				parts = path.split('.');
				part = parts.shift();
			}
			
			if (!this.hasOwnProperty(part) && !this.isComputed(part)) this.modelObservedProperties()[path] = null;
			return sup.apply(this, arguments);
		};
	}),
	
	/**
	* @private
	*/
	addObserver: function () {
		return this.observe.apply(this, arguments);
	},
	
	/**
	* @private
	*/
	constructor: kind.inherit(function (sup) {
		return function (props) {
			// ensure we have our own model property
			this.model = null;
		
			// adhere to normal approach to constructor properties hash
			props && utils.mixin(this, props);
			sup.apply(this, arguments);
		};
	}),
	
	/**
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.model && this.model.off('*', this._modelEvent, this);
		};
	})
	
});
