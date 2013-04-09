(function (enyo) {

	//*@public
	/**
		This mixin provides core support for bindings, bindings-arrays and a
		binding API to objects that implement it. It requires the computed
		property support and observer method support mixins.
	*/
	enyo.createMixin({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.BindingSupport",

		//*@public
		/**
			While binding kind may be overloaded on a per-binding basis
			for objects that intend to use a custom kind for all of their
			bindings, it may also be set here.
		*/
		defaultBindingKind: "enyo.Binding",

		//*@public
		/**
			An array of declared configurations for bindings that
			will be created on object instantiation.
		*/
		bindings: null,

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_supports_bindings: true,

		//*@protected
		_bindings_from_observers: null,

		// ...........................
		// COMPUTED PROPERTIES

		//*@protected
		_binding_constructor: enyo.computed(function () {
			return enyo.getPath(this.defaultBindingKind);
		}, {cached: true}),

		// ...........................
		// PUBLIC METHODS

		//*@public
		/**
			Accepts any number of hashes to be used to create a binding whose
			owner is this object by default.

			Returns a reference to the newly created binding and also adds the
			binding to this object's _bindings_ array.

			Note that calling the `destroy` method on a binding's owner will
			also clean up the binding itself.
		*/
		binding: function (/* _binding definitions_ */) {
			var definitions = arguments;
			var idx = 0;
			var len = definitions.length;
			var binding;
			var properties = {};
			var bindings = this.bindings;
			var def = this.get("_binding_constructor");
			var Ctor;
			var kind;
			for (; idx < len; ++idx) {
				enyo.mixin(properties, definitions[idx]);
			}
			if ((kind = properties.kind)) {
				if ("string" === typeof kind) {
					Ctor = enyo.getPath(properties.kind);
				}
				else if ("function" === typeof kind) {
					Ctor = kind;
				}
			}
			if (!Ctor || "function" !== typeof Ctor) {
				Ctor = def;
			}
			binding = new Ctor({owner: this, autoConnect: true}, properties);
			bindings.push(binding);
			return binding;
		},

		//*@public
		/**
			Usually called when the object's `destroy` method is executed, but may
			be called at any time to properly clean up any bindings associated with
			this object (i.e., any bindings that have their _owner_ property set
			to this object).

			This method does not remove bindings that originated from another object
			but are	currently bound to a property on this object.

			If so desired, one may pass in an array of bindings, in which case only
			those bindings specified in the array will be destroyed.
		*/
		clearBindings: function (subset) {
			var $bindings = subset || this.bindings;
			if (!$bindings.length) {
				return;
			}
			do {
				$bindings.shift().destroy();
			} while ($bindings.length);
		},

		//*@public
		/**
			Calls the `refresh` method on the bindings associated with this
			object, or on a passed-in array of bindings. In most scenarios, this
			method will be called automatically, with no need for explicit calls
			from the developer.
		*/
		refreshBindings: function (subset) {
			var $bindings = subset || this.bindings;
			var len = $bindings.length;
			var idx = 0;
			for (; idx < len; ++idx) {
				$bindings[idx].refresh();
			}
		},

		//*@public
		/**
			This method is typically not called directly, but is called by the
			binding when it is destroyed. It accepts a single binding as its
			parameter; the binding is removed from the _bindings_ array if it
			exists there. This method does not destroy the binding or dereference
			its _owner_ property.
		*/
		removeBinding: function (binding) {
			// sanity check on binding
			if (!enyo.exists(binding) || !(binding instanceof enyo.Binding)) {
				return;
			}
			var bindings = this.bindings || [];
			var idx = enyo.indexOf(binding, bindings);
			if (!!~idx) {
				bindings.splice(idx, 1);
			}
		},

		//*@public
		/**
			We overload the _addObserver_ method from _ObserverMethodSupport_
			so that we can track which observers belong to bindings and, later,
			clean them up appropriately.
		*/
		addObserver: function (property, fn, context) {
			if (fn && fn.bindingId) {
				this._bindings_from_observers.push(fn.bindingId);
			}
			return this.inherited(arguments);
		},

		// ...........................
		// PROTECTED METHODS

		//*@protected
		_constructor: function () {
			// initialize our bindings from observers array
			this._bindings_from_observers = [];
			return this.inherited(arguments);	
		},

		//*@protected
		create: function () {
			// we do a single pass at each of the binding declarations
			// and pass them to our binding creation method
			var $bindings = this.bindings || (this.bindings = []);
			var len = $bindings.length;
			var idx = 0;
			// we reset our bindings array because it will be used by our
			// binding method to store references to bindings owned by
			// this object
			this.bindings = [];
			for (; idx < len; ++idx) {
				this.binding($bindings[idx]);
			}
		},

		//*@protected
		destroy: function () {
			// we simply iterate over and destroy each of the bindings
			// in our bindings array
			var $bindings = this.bindings;
			var $ids = this._bindings_from_observers;
			var $id;
			var $bind;
			if ($bindings.length) {
				do {
					$bindings.pop().destroy();
				} while ($bindings.length);
			}
			// check for any bindings associated with us that aren't
			// destroyed yet
			if ($ids.length) {
				while ($ids.length) {
					$id = $ids.pop();
					$bind = enyo.Binding.find($id);
					if ($bind && !$bind.destroyed) {
						$bind.destroy();
					}
				}
			}
		}

		// ...........................
		// OBSERVERS

	});

}(enyo));
