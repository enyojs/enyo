(function (enyo) {
	
	var kind = enyo.kind;
	
	var ProxyObject = enyo.ProxyObject,
		Component = enyo.Component,
		ComputedSupport = enyo.ComputedSupport,
		EventEmitter = enyo.EventEmitter,
		oObject = enyo.Object;
	
	/**
		@private
	*/
	var BaseModelController = kind({
		kind: Component,
		mixins: [ComputedSupport, EventEmitter, ProxyObject]
	});
	
	/**
		Model instance proxy.
	
		The _model_ property is a reserved word and will conflict with the controller if it is an attribute
		of the model instance being proxied.
	
		@NOTE: Rules of property resolution - if the controller can call hasOwnProperty -> true it will look
		locally or if the property is resolved to be a computed property otherwise assume the proxy.
	
		@public
		@class enyo.ModelController
	*/
	kind(
		/** @lends enyo.ModelController.prototype */ {
		name: 'enyo.ModelController',
		kind: BaseModelController,
		
		/**
			@public
		*/
		model: null,
		
		/**
			@private
		*/
		proxyObjectKey: 'model',
		
		/**
			@private
			@method
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
			@private
			@method
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
			@private
			@method
		*/
		_getComputed: ComputedSupport.get.fn(oObject.prototype.get),
		
		/**
			@private
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
			@private
			@method
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
			@private
			@method
		*/
		modelObservedProperties: function () {
			return this._observedProps || (this._observedProps = {});
		},
		
		/**
			@private
			@method
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
			@private
			@method
		*/
		addObserver: function () {
			return this.observe.apply(this, arguments);
		},
		
		/**
			@private
			@method
		*/
		constructor: function (props) {
			// ensure we have our own model property
			this.model = null;
			
			// adhere to normal approach to constructor properties hash
			props && enyo.mixin(this, props);
		},
		
		/**
			@public
			@method
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.model && this.model.off('*', this._modelEvent, this);
			};
		})
		
	});
	
})(enyo);