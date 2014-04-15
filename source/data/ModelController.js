(function (enyo) {
	
	var kind = enyo.kind
		, inherit = enyo.inherit
		, isObject = enyo.isObject
		, mixin = enyo.mixin;
	
	var ProxyObject = enyo.ProxyObject
		, Component = enyo.Component
		// , ObserverSupport = enyo.ObserverSupport
		, ComputedSupport = enyo.ComputedSupport
		// , BindingSupport = enyo.BindingSupport
		, EventEmitter = enyo.EventEmitter
		, oObject = enyo.Object;
	
	/**
		@private
	*/
	var BaseModelController = kind({
		kind: Component,
		mixins: [/*ObserverSupport, */ComputedSupport, /*BindingSupport, */EventEmitter, ProxyObject]
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
		name: "enyo.ModelController",
		kind: BaseModelController,
		
		/**
			@public
		*/
		model: null,
		
		/**
			@private
		*/
		proxyObjectKey: "model",
		
		/**
			@private
		*/
		observers: [
			{method: "onChange", path: "model"}
		],
		
		/**
			@private
			@method
		*/
		get: inherit(function (sup) {
			return function (path) {
				return this.hasOwnProperty(path) || this.isComputed(path)? this.getLocal(path): sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
			@method
		*/
		set: inherit(function (sup) {
			return function (path) {
				return isObject(path) || (!this.hasOwnProperty(path) && !this.isComputed(path))? sup.apply(this, arguments): this.setLocal.apply(this, arguments);
			};
		}),
		
		/**
			@private
			@method
		*/
		getLocal: ComputedSupport.get.fn(oObject.prototype.get),
		
		/**
			@private
			@method
		*/
		setLocal: ComputedSupport.set.fn(oObject.prototype.set),
		
		/**
			@private
			@method
		*/
		onChange: function (was, is, path) {
			// unregister previous model if any
			if (was) was.off("*", this.onModelEvent, this);
			// register for events on new model if any
			if (is) is.on("*", this.onModelEvent, this);
			
			// either way we need to update any observers that might be related
			// to the model
			var props = this.modelObservedProperties();
			for (var key in props) {
				if ((!was && is) || (was && !is) || (was && is && was.attributes[key] !== is.attributes[key])) {
					this.notify(key, was && was.get(key), is && is.get(key));
				}
			}
			
			this.emit("model", {was: was, is: is});
		},
		
		/**
			@private
			@method
		*/
		onModelEvent: function (model, e, props) {
			// re-emit the event as expected with the only change being the originator (first param)
			// will be this controller but all listeners should expect to use the third parameter as
			// is the convention for model listeners
			this.emit(e, props, model);
			
			switch (e) {
			case "change":
				if (props) for (var key in props) this.notify(key, model.previous[key], props[key]);
				break;
			case "destroy":
				this.setLocal("model", null);
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
		observe: inherit(function (sup) {
			return function (path) {
				var part = path
					, parts;
				
				if (path.indexOf(".") > -1) {
					parts = path.split(".");
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
		// removeObserver: function () {
		// 	return this.unobserve.apply(this, arguments);
		// },
		
		/**
			@private
			@method
		*/
		constructor: function (props) {
			// ensure we have our own model property
			this.model = null;
			
			// adhere to normal approach to constructor properties hash
			props && mixin(this, props);
		},
		
		/**
			@public
			@method
		*/
		destroy: inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.model && this.model.off("*", this.onModelEvent, this);
			};
		})
		
	});
	
})(enyo);