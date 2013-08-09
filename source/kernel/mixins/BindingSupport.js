//*@protected
// ensure that bindings are a concatenated property for all kinds
enyo.concat.push("bindings");
//*@public
/**
	These properties provide the public API for using _enyo.Bindings_ with
	any _enyo.Object_ kind or subclass. This support requires the _ObserverSupport_
	and _ComputedPropertiesSupport_ _mixins_ to have been applied. This API is
	available on __all__ _enyo.Objects_ and subkinds thus it does not need to be
	added as a _mixin_ to any other _kind_.
*/
enyo.BindingSupport = {
	name: "BindingSupport",
	/**
		While binding kind may be overloaded on a per-binding basis
		for objects that intend to use a custom kind for all of their
		bindings, it may also be set here.
	*/
	defaultBindingKind: enyo.Binding,
	/**
		Set this to an array of binding declarations that will be created
		when the object is instantiated. Post-construction this array will
		contain a reference to all available bindings on the instance of the kind.
	*/
	bindings: null,
	/**
		To create a binding on its own (as opposed to with the _bindings_ array
		for the kind) pass the properties to this method. It accepts multiple
		hashes of properties to apply to the binding. The binding will have its
		_owner_ set to this instance and a reference to the newly created binding
		will be returned. When this instance is destroyed, all bindings that it owns
		will also be destroyed. If this is called too early (before bindings have
		been fully initialized) it will add the properties to the initialization queue
		and return `undefined`.
	*/
	binding: function () {
		var	defs = enyo.toArray(arguments),
			bs = this.bindings,
			props = enyo.mixin(defs), bd;
		props.kind || (props.kind = this.defaultBindingKind);
		props.owner || (props.owner = this);
		if (this._bindingsInitialized === false) {
			bs.push(props);
		} else {
			// we only want to resolve the kind if it isn't already
			// the correct constructor -- note this forces the kind
			// to be resolved at that time
			if (!enyo.isFunction(props.kind)) {
				props.kind = enyo.getPath(props.kind);
			}
			bs.push((bd = new props.kind(props)));
			if (bd._sourcePath && bd.from[0] === ".") {
				this.addObserver(bd._sourcePath, this._rebuildSource(bd));
			}
			if (bd._targetPath && bd.to[0] === ".") {
				this.addObserver(bd._targetPath, this._rebuildTarget(bd));
			}
		}
		return bd;
	},
	/**
		Usually called when the object's `destroy` method is executed, but may
		be called at any time to properly clean up any bindings associated with
		this object (i.e., any bindings that have their _owner_ property set
		to this object).

		This method does not remove bindings that originated from another object
		but are currently bound to a property on this object.

		If so desired, one may pass in an array of bindings, in which case only
		those bindings specified in the array will be destroyed.
	*/
	clearBindings: function (subset) {
		var bs = subset || this.bindings;
		for (var i=0, b; (b=bs[i]); ++i) {
			b.destroy();
		}
	},
	/**
		Calls the `refresh` method on the bindings associated with this
		object, or on a passed-in array of bindings.

		Differs from _rebuildBindings_ in that, instead of
		rediscovering the source and target of each binding, it
		remembers them from the most recent setup.

		In most scenarios, this method will be called automatically,
		with no need for explicit calls from the developer.
	*/
	refreshBindings: function (subset) {
		var bs = subset || this.bindings;
		for (var i=0, b; (b=bs[i]); ++i) {
			b.refresh();
		}
	},
	/**
		Calls the `rebuild` method on the bindings associated with this
		object, or on a passed-in array of bindings.

		Differs from _refreshBindings_ in that it forces the source and
		target of each binding to be rediscovered using the specified
		paths, rather than remembered from a previous setup.

		In most scenarios, this method will be called automatically,
		with no need for explicit calls from the developer.
	*/
	rebuildBindings: function (subset) {
		var bs = subset || this.bindings;
		for (var i=0, b; (b=bs[i]); ++i) {
			b.rebuild();
		}
	},
	/**
		This method is typically not called directly, but is called by the
		binding when it is destroyed. It accepts a single binding as its
		parameter; the binding is removed from the _bindings_ array if it
		exists there. This method does not destroy the binding or dereference
		its _owner_ property.
	*/
	removeBinding: function (binding) {
		if (binding) {
			var i = enyo.indexOf(binding, this.bindings);
			if (!!~i) { 
				this.bindings.splice(i, 1);
				if (binding._rebuildTarget) {
					this.removeObserver(binding._targetPath, binding._rebuildTarget);
					binding._rebuildTarget = null;
				}
				if (binding._rebuildSource) {
					this.removeObserver(binding._sourcePath, binding._rebuildSource);
					binding._rebuildSource = null;
				}
			}
		}
	},
	//*@public
	/**
		This method is exposed for overloading purposes if necessary.
		It us used to initialize bindings on an instance when it is
		created. When _bindings_ are initialized they attempt to connect
		(if the `autoConnect` flag is `true` which it is by default). If they
		cannot they will register for notification if possible for when that
		object becomes available and they will connect and synchronize then.
	*/
	initBindings: function () {
		if (false === this._bindingsInitialized) {
			// reduce object clutter and allow calls to this.binding to actually
			// create the binding now
			delete this._bindingsInitialized;
			var os = this.bindings,
				// we will now reused the property `bindings` with the actual binding
				// references
				bs = (this.bindings = []);
			for (var i=0, b; (b=bs[i]); ++i) {
				bs.push(this.binding(b));
			}
		}
	},
	//*@protected
	/**
		We have this flag to help indicate if bindings have been initialized
		or not for this object. It is used as an explicit `false` test because
		it is removed from the object instance once initialized to reduce object clutter.
	*/
	_bindingsInitialized: false,
	constructor: enyo.super(function (sup) {
		return function () {
			// ensure we have at least an empty array here during
			// normal initialization
			this.bindings = this.bindings || [];
			// continue with the normal constructor chain
			var r = sup.apply(this, arguments);
			// now we go ahead and create the bindings knowing that they
			// will register for missing targets/sources if they become
			// available later
			this.initBindings();
			return r;
		};
	}),
	destroy: enyo.super(function (sup) {
		return function () {
			// destroy all bindings that belong to us
			var bs = this.bindings;
			for (var i=0, b; (b=bs[i]); ++i) {
				b.destroy();
			}
			sup.apply(this, arguments);
		};
	},
	_rebuildSource: function (binding) {
		var fn = function () {
			binding.source = null;
			binding._sourceProperty = null;
			binding.refresh();
		};
		binding._rebuildSource = fn;
		return fn;
	},
	_rebuildTarget: function (binding) {
		var fn = function () {
			binding.target = null;
			binding._targetProperty = null;
			binding.refresh();
		};
		binding._rebuildTarget = fn;
		return fn;
	}
};
