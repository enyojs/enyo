(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var ProxyObject = enyo.ProxyObject,
		Component = enyo.Component,
		ComputedSupport = enyo.ComputedSupport,
		EventEmitter = enyo.EventEmitter,
		oObject = enyo.Object;
	
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
	* A controller designed to proxy an underlying {@link enyo.Model}. Other
	* [kinds]{@glossary kind} may [bind]{@link enyo.BindingSupport.bindings} to this
	* controller as if it were an `enyo.Model`. Using the
	* [model]{@link enyo.ModelController#model} reserved property, the actual model
	* may be changed without the bindings' needing to know. It will also propagate
	* events [emitted]{@link enyo.EventEmitter.emit} by the underlying model.
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
	* @class enyo.ModelController
	* @extends enyo.Component
	* @mixes enyo.ComputedSupport
	* @mixes enyo.EventEmitter
	* @mixes enyo.ProxyObject
	* @public
	*/
	kind(
		/** @lends enyo.ModelController.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.ModelController',
		
		/**
		* @private
		*/
		kind: BaseModelController,
		
		/**
		* The {@link enyo.Model} to proxy. If this is set to an instance of `enyo.Model`,
		* the [controller]{@link enyo.ModelController} will propagate `enyo.Model`
		* [events]{@glossary event} and [notifications]{@link enyo.ObserverSupport.notify}.
		* **No bindings should ever bind directly to attributes of this property.**
		*
		* Also note that this is a reserved property name and will collide with any
		* [attribute]{@link enyo.Model#attributes} named `"model"`. This scenario should
		* be avoided.
		*
		* @type enyo.Model
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
		get: enyo.inherit(function (sup) {
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
		set: enyo.inherit(function (sup) {
			return function (path) {
				
				if (typeof path == 'string') {
					if (this.hasOwnProperty(path)) {
						return this.isComputed(path) ? this : enyo.setPath.apply(this, arguments);
					}
				}
				
				return sup.apply(this, arguments);
			};
		}),
		
		/**
		* @method
		* @private
		*/
		_getComputed: ComputedSupport.get.fn(oObject.prototype.get),
		
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
		observe: enyo.inherit(function (sup) {
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
		constructor: enyo.inherit(function (sup) {
			return function (props) {
				// ensure we have our own model property
				this.model = null;
			
				// adhere to normal approach to constructor properties hash
				props && enyo.mixin(this, props);
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.model && this.model.off('*', this._modelEvent, this);
			};
		})
		
	});
	
})(enyo, this);