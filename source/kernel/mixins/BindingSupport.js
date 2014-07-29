(function (enyo, scope) {
	
	var inherit = enyo.inherit
		// , forEach = enyo.forEach
		, toArray = enyo.toArray
		, isString = enyo.isString
		, mixin = enyo.mixin
		, defaultBindingKind = enyo.defaultBindingKind
		, constructorForKind = enyo.constructorForKind;
	
	enyo.concatenated.push('bindings');
	
	/**
	* An internally-used {@glossary mixin} that is added to {@link enyo.Object}
	* and its [subkinds]{@glossary subkind}. It includes public and protected API
	* methods for working with [bindings]{@link enyo.Binding}.
	*
	* @mixin enyo.BindingSupport
	* @protected
	*/
	enyo.BindingSupport = {
		
		/**
		* @private
		*/
		name: 'BindingSupport',
		
		/**
		* @private
		*/
		_bindingSupportInitialized: false,
		
		/**
		* Imperatively creates a [binding]{@link enyo.Binding}. Merges a variable
		* number of [hashes]{@glossary Object} and instantiates a binding that
		* will have its [owner]{@link enyo.Binding#owner} property set to the callee
		* (the current {@link enyo.Object}). Bindings created in this way will be
		* [destroyed]{@link enyo.Binding#destroy} when their `owner` is
		* [destroyed]{@link enyo.Object#destroy}.
		*
		* @param {...Object} props A variable number of [hashes]{@glossary Object} that will
		*	be merged into the properties applied to the {@link enyo.Binding} instance.
		* @returns {this} The callee for chaining.
		* @public
		*/
		binding: function () {
			var args = toArray(arguments)
				, props = mixin(args)
				, bindings = this.bindings || (this.bindings = [])
				, Ctor, bnd;
				
			props.owner = props.owner || this;
			Ctor = props.kind = props.kind || this.defaultBindingKind || defaultBindingKind;
			
			if (this._bindingSupportInitialized) {
				isString(Ctor) && (Ctor = props.kind = constructorForKind(Ctor));
				bnd = new Ctor(props);
				bindings.push(bnd);
				return bnd;
			} else bindings.push(props);
			
			return this;
		},
		
		/**
		* Removes and [destroys]{@link enyo.Binding#destroy} all of, or a subset of,
		* the [bindings]{@link enyo.Binding} belonging to the callee.
		*
		* @param {enyo.Binding[]} [subset] - The optional [array]{@glossary Array} of
		*	[bindings]{@link enyo.Binding} to remove.
		* @returns {this} The callee for chaining.
		* @public
		*/
		clearBindings: function (subset) {
			var bindings = subset || (this.bindings && this.bindings.slice());
			bindings.forEach(function (bnd) {
				bnd.destroy();
			});
			
			return this;
		},
		
		/**
		* Removes a single {@link enyo.Binding} from the callee. (This does not
		* [destroy]{@link enyo.Binding#destroy} the binding.) Also removes the
		* [owner]{@link enyo.Binding#owner} reference if it is the callee.
		*
		* It should be noted that when a binding is destroyed, it is automatically
		* removed from its owner.
		*
		* @param {enyo.Binding} binding - The {@link enyo.Binding} instance to remove.
		* @returns {this} The callee for chaining.
		* @public
		*/
		removeBinding: function (binding) {
			enyo.remove(binding, this.bindings);
			
			if (binding.owner === this) binding.owner = null;
			
			return this;
		},
		
		/**
		* @private
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
		* @private
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
	* An internally-used {@glossary mixin} applied to {@link enyo.Component}
	* instances to better support [bindings]{@link enyo.Binding}.
	*
	* @mixin enyo.ComponentBindingSupport
	* @protected
	*/
	enyo.ComponentBindingSupport = {
		
		/**
		* @private
		*/
		name: 'ComponentBindingSupport',
		
		/**
		* @private
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
	
	/**
	* @private
	*/
	enyo.concatHandler = function (ctor, props, instance) {
		var proto = ctor.prototype || ctor
			, kind = props && (props.defaultBindingKind || defaultBindingKind)
			, defaults = props && props.bindingDefaults;
		
		sup.call(this, ctor, props, instance);
		if (props.bindings) {
			props.bindings.forEach(function (bnd) {
				defaults && mixin(bnd, defaults, flags);
				bnd.kind || (bnd.kind = kind); 
			});
			
			proto.bindings = proto.bindings? proto.bindings.concat(props.bindings): props.bindings;
			delete props.bindings;
		}
	};
	
})(enyo, this);