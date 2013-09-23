
//*@protected
// ensure that bindings are a concatenated property for all kinds
enyo.concat.push("bindings");
//*@public
/**
	These properties provide the public API for using [enyo.Binding](#enyo.Binding)
	with any [enyo.Object](#enyo.Object) kind or subclass. This support requires
	the [ObserverSupport](#enyo/source/kernel/mixins/ObserverSupport.js) and
	[ComputedSupport](#enyo/source/kernel/mixins/ComputedSupport.js) mixins to
	have been applied. This API is available on _all_ instances and subkinds of
	_enyo.Object_; thus, it does not need to be added as a mixin to any other kind.
*/
enyo.BindingSupport = {
	name: "BindingSupport",
	/**
		While the binding kind may be overloaded on a per-binding basis
		for objects that intend to use a custom kind for all of their
		bindings, it may also be set here.
	*/
	defaultBindingKind: null,
	/**
		Set this to an array of binding declarations that will be created
		when the object is instantiated. Post-construction, this array will
		contain a reference to all available bindings on the instance of the kind.
	*/
	bindings: null,
	/**
		If the _expandMacros_ flag is true for a binding (the default), then the
		owner of the binding may create custom expansion rules for specific
		properties or override defaults if necessary. Add the macro tokens you would
		like to expand to this hash and map them to either a property path to use
		instead of the macro, or to a method that will return the correct path for
		macro expansion.
	*/
	bindingMacros: null,
	/**
		Set this to a hash of the available options to supply to all bindings
		created by this object. The defaults will only be used if the specified
		properties are not found in the binding definition.
	*/
	bindingDefaults: null,
	/**
		To create a binding on its own (not with the _bindings_ array for the kind),
		pass the properties to this method. It accepts multiple hashes of properties
		to apply to the binding. The binding will have its owner set to this
		instance and a reference to the newly created binding will be returned. When
		this instance is destroyed, all the bindings that it owns will also be
		destroyed. If this method is called too early (i.e., before bindings have
		been fully initialized), it will add the properties to the initialization
		queue and return _undefined_.
	*/
	binding: function () {
		var defs = enyo.toArray(arguments),
			bs = this.bindings || (this.bindings = []),
			props = enyo.mixin(defs),
			dl = this.bindingDefaults, bd;
		props.kind = props.kind || this.defaultBindingKind || enyo.defaultBindingKind;
		props.owner = props.owner || this;
		if (dl) { enyo.mixin(props, dl, {ignore: true}); }
		if (this._bindingSupportInitialized === false) {
			bs.push(props);
		} else {
			var q, auto = false;
			if (!this._bindingSyncAllowed) {
				q = this._bindingSyncQueue || (this._bindingSyncQueue = []);
			}
			// we only want to resolve the kind if it isn't already
			// the correct constructor -- note this forces the kind
			// to be resolved at that time
			if (!enyo.isFunction(props.kind)) {
				props.kind = enyo.getPath(props.kind);
			}
			if (q && false !== props.autoSync) {
				auto = true;
				props.autoSync = false;
			}
			bs.push((bd = new props.kind(props)));
			if (bd._sourcePath && bd.from[0] === ".") {
				if (bd._sourcePath == "$") {
					this.addObserver("$." + bd._sourceFrom, this._rebuildSource(bd));
				} else {
					this.addObserver(bd._sourcePath, this._rebuildSource(bd));
				}
			}
			if (bd._targetPath && bd.to[0] === ".") {
				if (bd._targetPath == "$") {
					this.addObserver("$." + bd._targetFrom, this._rebuildTarget(bd));
				} else {
					this.addObserver(bd._targetPath, this._rebuildTarget(bd));
				}
			}
			if (q && auto) {
				q.push(bd);
			}
		}
		return bd;
	},
	/**
		Usually called when the object's _destroy()_ method is executed, but may be
		called at any time to properly clean up the bindings associated with this
		object (i.e., any bindings that have their _owner_ property set	to this
		object).

		This method does not remove bindings that originated from another object
		but are currently bound to a property on this object.

		If desired, one may pass in an array of bindings, in which case only the
		bindings specified in the array will be destroyed.
	*/
	clearBindings: function (subset) {
		var bs = subset || this.bindings;
		if (!bs) { return; }
		for (var i=0, b; (b=bs[i]); ++i) {
			b.destroy();
		}
	},
	/**
		Calls the _refresh()_ method on the bindings associated with this object, or
		on a passed-in array of bindings.

		Differs from _rebuildBindings()_ in that, instead of rediscovering the
		source and target of each binding, it remembers them from the most recent
		setup.

		In most scenarios, this method will be called automatically, with no need
		for explicit calls from the developer.
	*/
	refreshBindings: function (subset) {
		var bs = subset || this.bindings;
		if (!bs) { return; }
		for (var i=0, b; (b=bs[i]); ++i) {
			b.refresh();
		}
	},
	/**
		Calls the _rebuild()_ method on the bindings associated with this object, or
		on a passed-in array of bindings.

		Differs from _refreshBindings()_ in that it forces the source and target of
		each binding to be rediscovered using the specified paths, rather than
		remembering them from a previous setup.

		In most scenarios, this method will be called automatically, with no need
		for explicit calls from the developer.
	*/
	rebuildBindings: function (subset) {
		var bs = subset || this.bindings;
		if (!bs) { return; }
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
		var b = binding,
			bs = this.bindings;
		if (b && bs) {
			var i = enyo.indexOf(b, bs);
			if (!!~i) {
				bs.splice(i, 1);
				if (b._rebuildTarget) {
					this.removeObserver(b._targetPath, b._rebuildTarget);
					b._rebuildTarget = null;
				}
				if (b._rebuildSource) {
					this.removeObserver(b._sourcePath, b._rebuildSource);
					b._rebuildSource = null;
				}
			}
		}
	},
	//*@public
	/**
		This method is exposed for overloading purposes if necessary.
		It is used to initialize bindings on an instance when it is
		created. When bindings are initialized, they attempt to connect
		(if the _autoConnect_ flag is true, which it is by default). If they
		cannot connect, they will (if possible) register to be notified when that
		object becomes available, and will connect and synchronize then.
	*/
	initBindings: function () {
		var i, b;
		if (false === this._bindingSupportInitialized) {
			this._bindingSupportInitialized = undefined;
			var os = this.bindings;
			if (!os) { return; }
			// we will now reuse the property `bindings` with the actual binding
			// references
			this.bindings = [];
			for (i=0; (b=os[i]); ++i) {
				this.binding(b);
			}
		}
		if (this._bindingSyncAllowed) {
			var q = this._bindingSyncQueue;
			if (q && q.length) {
				for (i=0; (b=q[i]); ++i) {
					// we set this because that is the only option that would
					// have allowed it to be in this queue
					b.autoSync = true;
					b.sync();
				}
				q = null;
			}
		}
	},
	constructed: enyo.inherit(function (sup) {
		return function () {
			// now we go ahead and create the bindings, knowing that they
			// will register for missing targets/sources if they become
			// available later
			if (this.bindings) { this.initBindings(); }
			else { this._bindingSupportInitialized = undefined; }
			sup.apply(this, arguments);
		};
	}),
	destroy: enyo.inherit(function (sup) {
		return function () {
			// destroy all bindings that belong to us
			var bs = this.bindings;
			if (bs) {
				for (var i=0, b; (b=bs[i]); ++i) {
					b.destroy();
				}
			}
			sup.apply(this, arguments);
		};
	}),
	_rebuildSource: function (binding) {
		var fn = function () {
			binding.disconnectSource();
			binding.source = null;
			binding.refresh();
		};
		binding._rebuildSource = fn;
		return fn;
	},
	_rebuildTarget: function (binding) {
		var fn = function () {
			binding.disconnectTarget();
			binding.target = null;
			binding.refresh();
		};
		binding._rebuildTarget = fn;
		return fn;
	},
	/**
		Used internally by bindings to expand macros by exposing public API features
		to aid in dynamic macro expansion. Attempts to use special properties (if
		they were set) to handle specific macros, overriding normal handling.
	*/
	_bindingExpandMacro: function (lex, token, macro, prop, binding) {
		var ms = this.bindingMacros;
		if (ms) {
			var m = ms[lex];
			if (m) {
				var fn = this[m];
				if (fn && enyo.isFunction(fn)) {
					m = fn.call(this, lex, token, macro, prop, binding);
				}
				return m;
			}
		}
		return token;
	},
	/**
		Flag that indicates whether bindings have been initialized for this object.
		It is used as an explicit _false_ test because it is removed from the object
		instance once initialized, to reduce object clutter.
	*/
	_bindingSupportInitialized: false,
	_bindingSyncAllowed: true,
	_bindingSyncQueue: null
};
//*@public
/**
	BindingSupport is available on instances of _enyo.Object_, but it is necessary
	to overload methods that aren't available on _enyo.Object_ but are on
	_enyo.Component_, so it is added as additional functionality.
*/
enyo.ComponentBindingSupport = {
	name: "ComponentBindingSupport",
	//*@protected
	/**
		There is a special property, *_bindingTransformOwner*, that needs to be
		chained down into children to shortcut bindings work to find transforms
		for inlined bindings -- their owner is the component they are nested on
		but the transform will most likely exist on the instance owner.
	*/
	adjustComponentProps: enyo.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			props._bindingTransformOwner = props._bindingTransformOwner || this.getInstanceOwner();
		};
	}),
	constructed: enyo.inherit(function (sup) {
		return function () {
			if (this.bindings) {
				this._bindingSyncAllowed = false;
				this.initBindings();
				// the next time this is called later during initialization the bindings will
				// have been created but this will allow them to be synchronized at the appropriate
				// time
				this._bindingSyncAllowed = true;
			}
			return sup.apply(this, arguments);
		};
	})
};
//*@protected
enyo.concatHandler("bindingMacros", function (proto, props) {
	if (props.bindingMacros) {
		var pm = proto.bindingMacros || (proto.bindingMacros = {}),
			rm = props.bindingMacros;
		enyo.mixin(enyo.clone(pm), rm);
		delete props.bindingMacros;
	}
});
