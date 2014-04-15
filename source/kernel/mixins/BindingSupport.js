(function (enyo) {
	
	var inherit = enyo.inherit
		// , forEach = enyo.forEach
		, toArray = enyo.toArray
		, isString = enyo.isString
		, mixin = enyo.mixin
		, remove = enyo.remove
		, defaultBindingKind = enyo.defaultBindingKind
		, constructorForKind = enyo.constructorForKind;
	
	enyo.concatenated.push("bindings");
	
	/**
		@public
		@mixin enyo.BindingSupport
	*/
	enyo.BindingSupport = {
		name: "BindingSupport",
		
		/**
			@private
		*/
		_bindingSupportInitialized: false,
		
		/**
			@public
			@method
		*/
		binding: function () {
			var args = toArray(arguments)
				, props = mixin(args)
				, bindings = this.bindings || (this.bindings = [])
				, ctor, bnd;
				
			props.owner = props.owner || this;
			ctor = props.kind = props.kind || this.defaultBindingKind || defaultBindingKind;
			
			if (this._bindingSupportInitialized) {
				isString(ctor) && (ctor = props.kind = constructorForKind(ctor));
				bnd = new ctor(props);
				bindings.push(bnd);
				return bnd;
			} else bindings.push(props);
		},
		
		/**
			@public
			@method
		*/
		clearBindings: function (subset) {
			var bindings = subset || (this.bindings && this.bindings.slice());
			bindings.forEach(function (bnd) {
				bnd.destroy();
			});
		},
		
		/**
			@public
			@method
		*/
		removeBinding: function (bnd) {
			remove(bnd, this.bindings);
		},
		
		/**
			@private
			@method
		*/
		constructed: inherit(function (sup) {
			return function () {
				var bindings = this.bindings;
				this._bindingSupportInitialized = true;
				bindings && (this.bindings = []) && bindings.forEach(function (def) {
					this.binding(def);
				}, this);
				sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
			@method
		*/
		destroy: inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.bindings && this.bindings.length && this.clearBindings();
				this.bindings = null;
			};
		})
	};
	
	/**
		@private
		@mixin enyo.ComponentBindingSupport
	*/
	enyo.ComponentBindingSupport = {
		name: "ComponentBindingSupport",
		
		/**
			@private
			@method
		*/
		adjustComponentProps: inherit(function (sup) {
			return function (props) {
				sup.apply(this, arguments);
				props.bindingTransformOwner || (props.bindingTransformOwner = this.getInstanceOwner());
			};
		})
	};
	
	/**
		Hijack the original so we can add additional default behavior.
	*/
	var sup = enyo.concatHandler
		, flags = {ignore: true};
	
	enyo.concatHandler = function (ctor, props) {
		var proto = ctor.prototype || ctor
			, kind = props && (props.defaultBindingKind || defaultBindingKind)
			, defaults = props && props.bindingDefaults;
		
		sup.call(this, ctor, props);
		if (props.bindings) {
			props.bindings.forEach(function (bnd) {
				defaults && mixin(bnd, defaults, flags);
				bnd.kind || (bnd.kind = kind); 
			});
			
			proto.bindings = proto.bindings? proto.bindings.concat(props.bindings): props.bindings;
			delete props.bindings;
		}
	};
	
})(enyo);