(function (enyo) {

	//*@protected
	// The internal store for bindings so they can be found by id later
	var _bindingMap = {},
	/**
		Used by the binding's setter for both targets and sources
		when determing whether or not to force a notification to fire.
		We cannot easily determine this for types that are passed
		by reference (e.g., arrays and native JavaScript objects). But
		for these types it is much clearer in nearly all cases.
	*/
	_force = /(string|number|boolean)/;
	/**
		For tracking purposes we count bindings.
	*/
	enyo.BindingCount = 0;

	//*@public
	/**
		_enyo.Binding_ is a mechanism used to keep properties synchronized. A
		binding may be used to link two properties on different objects, or even two
		properties on the same object. Once a binding has been established, it will
		wait for change notifications; when a notification arrives, the binding will
		synchronize the value between the two ends. Note that bindings may be
		one-way (the default) or two-way.

		Usually, you will not need to create _enyo.Binding_ objects arbitrarily, but
		will instead rely on the public [BindingSupport
		API](#enyo/source/kernel/mixins/BindingSupport.js), which is applied to
		[enyo.Object](#enyo.Object) and so is available on all of its subkinds.
	*/
	enyo.kind({
		name: "enyo.Binding",
		kind: null,
		noDefer: true,
		/**
			The _from_ property designates a path in which the property of the source
			to bind from may be found. If the source is explicitly provided and the
			path is relative (i.e., it begins with a "."), it is relative to the
			source; otherwise, it is relative to the owner of the binding. To have a
			binding be evaluated from the global scope, prefix the path with a "^". If
			the source and the "^" are used in tandem, the "^" will be ignored and the
			path will be assumed to be relative to the provided source.
		*/
		from: "",
		/**
			The _to_ property designates a path in which the property of the target to
			bind from may be found. If the target is explicitly provided and the path
			is relative (i.e., it begins with a "."), it is relative to the target;
			otherwise, it is relative to the owner of the binding. To have a binding
			be evaluated from the global scope, prefix the path with a "^". If the
			target and the "^" are used in tandem, the "^" will be ignored and the
			path will be assumed to be relative to the provided target.
		*/
		to: "",
		/**
			Set this only to a reference for an object to use as the source for the
			binding. If this is not a bindable object, the source will be derived from
			the _from_ property during initialization.
		*/
		source: null,
		/**
			Set this to false to keep the binding from propagating `undefined` in
			either direction. For more control over the values that get propagated
			see [transform](#transform). Defaults to `true`.
		*/
		allowUndefined: true,
		/**
			Set this only to a reference for an object to use as the target for the
			binding. If this is not a bindable object, the target will be derived from
			the _to_ property during initialization.
		*/
		target: null,
		/**
			Set this to a function or the name of a method on the owner of this
			binding. A transform method is used to programmatically modify the value
			being synchronized. The method will be executed with three parameters, the
			_value_ being synchronized, the _direction_ (a string matching either
			"source" or "target", as in "going to the source") and a reference to this
			binding. In cases where the binding should be interrupted and not
			propagate the synchronization at all, call the _stop()_ method of the
			passed-in binding reference.
		*/
		transform: "",
		/**
			If the binding was able to resolve both ends (i.e., its _source_ and
			_target_ objects), this boolean will be true. Setting this manually will
			have undesirable effects.
		*/
		connected: false,
		/**
			Each binding has a unique id that can be used with the global static
			method _enyo.Binding.find()_ to retrieve a reference to that binding. It
			can also be used to track registered listeners on objects back to their
			bindings.
		*/
		id: "",
		/**
			If a binding is one-way, this flag should be true (the default). If this
			flag is set to false, the binding will be two-way.
		*/
		oneWay: true,
		/**
			By default, a binding will attempt to connect to both ends (_source_ and
			_target_). If this process should be deferred, set this flag to false.
		*/
		autoConnect: true,
		/**
			By default, a binding will attempt to synchronize its values from its
			_source_ to its	_target_. If this process should be deferred, set this
			flag to false.
		*/
		autoSync: true,
		/**
			The _owner_ property is used extensively for various purposes within a
			binding. One primary purpose is to serve as a root object from which to
			search for its ends (the _source_ and/or _target_). If the owner created
			the binding, it will also be responsible for destroying it
			(automatically).
		*/
		owner: null,
		/**
			Boolean indicating whether this binding has been destroyed. Do not change
			this flag arbitrarily.
		*/
		destroyed: false,
		statics: {
			/**
				This method may be used to retrieve a binding by its id globally. Simply
				pass in the known _id_ string. If the id is found, the method will
				return a reference to the binding; otherwise, it will return
				_undefined_.
			*/
			find: function (id) {
				return _bindingMap[id];
			}
		},
		//*@protected
		sourceObserver: null,
		targetObserver: null,
		sourceConnected: false,
		targetConnected: false,
		sourceRegistered: false,
		targetRegistered: false,
		registeredSource: null,
		registeredTarget: null,
		sourcePath: "",
		targetPath: "",
		sourceProp: "",
		targetProp: "",
		building: true,
		//* Used internally to track the original values passed to the binding for rebuilding.
		originals: null,
		constructor: function (props) {
			if (props) {
				enyo.mixin(this, props);
			}
			this.id = enyo.uid("binding");
			_bindingMap[this.id]          = this;
			// faster this way than calling mixin or only or any other helper/convenience
			// method to do the same thing...
			this.originals        = this.originals || {};
			this.originals.from   = this.from;
			this.originals.to     = this.to;
			this.originals.source = this.source;
			this.originals.target = this.target;
			this.initTransform();
			this.refresh();
			enyo.BindingCount++;
		},
		isConnected: function () {
			this.connected = (this.sourceConnected && this.targetConnected);
			return this.connected;
		},
		registered: function (which, object) {
			if (which == "source") {
				this.sourceRegistered = true;
				this.registeredSource = object;
			} else if (which == "target") {
				this.targetRegistered = true;
				this.registeredTarget = object;
			}
			if (this.autoSync && this.isRegistered() && !this.synchronizing) {
				this.sync();
			}
		},
		isRegistered: function () {
			return !! (this.sourceRegistered && this.targetRegistered);
		},
		syncFromSource: function () {
			if (!this.synchronizing) {
				this.synchronizing = true;
				if (this.isConnected() && this.isRegistered()) {
					var value = this.getSourceValue(),
						fn    = this.transform;
					if (fn && typeof fn == "function") {
						value = fn.call(this.owner || this, value, "source", this);
					}
					if (this.allowUndefined || value !== undefined) {
						this.setTargetValue(value);
					}
				}
				this.synchronizing = false;
			}
		},
		syncFromTarget: function () {
			if (!this.oneWay && !this.synchronizing) {
				this.synchronizing = true;
				if (this.isConnected() && this.isRegistered()) {
					var value = this.getTargetValue(),
						fn    = this.transform;
					if (fn && typeof fn == "function") {
						value = fn.call(this.owner || this, value, "target", this);
					}
					if (this.allowUndefined || value !== undefined) {
						this.setSourceValue(value);
					}
				}
				this.synchronizing = false;
			}
		},
		resolve: function () {
			var source = this.source,
				target = this.target,
				from   = this.from,
				to     = this.to,
				tp, sp;
			// this allows empty bindings to be created
			if (!from || !to) { return; }
			// this is the first track and should only be reachable if the binding has not yet been
			// built or it has been completely reset, on subsequent calls this path will be skipped
			if (this.building) {
				if (from[0] != "." && from[0] != "^") {
					throw "enyo.Binding: from path must begin with `.` or `^`";
				} else if (to[0] != "." && to[0] != "^") {
					throw "enyo.Binding: to path must beging with `.` or `^`";
				}
				// both of the following scenarios should only happen if the to/from are relative
				// if not they will fail later and this is intended as it is a logical fallacy to
				// both supply the global flag and a source/target of any sort
				if (typeof source == "string") {
					if (source[0] != "." && source[0] != "^") {
						throw "enyo.Binding: if source is a string it must begin with `.` or `^`";
					}
					from = ((source == "."? "": source) + from);
					source = null;
				}
				if (typeof target == "string") {
					if (target[0] != "." && target[0] != "^") {
						throw "enyo.Binding: if target is a string it must begin with `.` or `^`";
					}
					to = ((target == "."? "": target) + to);
					target = null;
				}
				// if we need to, infer the root paths
				if (!source) {
					this.source = source = (from[0] == "."? this.owner: enyo.global);
				}
				if (!target) {
					this.target = target = (to[0]   == "."? this.owner: enyo.global);
				}
				// update our properties that will be used later for actually connecting the pieces
				sp                        = from.slice(1).split(".");
				tp                        = to  .slice(1).split(".");
				// unfortunately special handling is required for cases where the object requested is
				// actually a reference to a component in the `$` hash
				var is                    = enyo.lastIndexOf(".", from);
				var it                    = enyo.lastIndexOf(".", to);
				this.sourcePath           = (from[0] == "^"? sp.slice(0, -1): sp).join(".");
				this.targetPath           = (to[0] == "^"? tp.slice(0,-1): tp).join(".");
				if (is > -1 && from[is-1] == "$") {
					// this means that the final property we need to request is something on the
					// hash directly and not a property of that object
					this.sourceProp       = sp.slice(-2).join(".");
				} else {
					this.sourceProp       = sp  .pop();
				}
				if (it > -1 && from[it-1] == "$") {
					// same situation as for the source above
					this.targetProp       = tp.slice(-2).join(".");
				} else {
					this.targetProp       = tp  .pop();
				}
				this.building             = false;
			}
			if (source === enyo.global) {
				this.source       = enyo.getPath(this.sourcePath);
				this.sourceGlobal = true;
			}
			if (target === enyo.global) {
				// if this is also a one-way binding we have a special need to reduce the path
				// by one more when retrieving the base target so we can attempt to register an observer
				// as expected for changes on the last base object in the chain prior to the
				// final property
				tp                    = this.targetPath.split(".");
				this.targetGlobalPath = tp.slice(0,-1).join(".");
				this.targetPath       = tp.pop();
				this.target           = enyo.getPath(this.targetGlobalPath);
				this.targetGlobal     = true;
			}
			return this;
		},
		connectSource: function () {
				// the actual source/root object we need to connect to, without this reference
				// or a starting place, we cannot connect
			var source = this.source,
				// the path from the root object leading to the final property (which we will
				// be registering for)
				path   = this.sourceGlobal? this.sourceProp: this.sourcePath,
				// the observer we need to register
				fn     = this.sourceObserver,
				id     = this.sourceObserverId || (this.sourceObserverId=enyo.uid("__bindingObserver__"));
			// if we were searching from a global path but originally didn't find the source it
			// will be enyo.global and we need to try and find it again
			if (source === enyo.global) {
				source = this.resolve().source;
			}
			if (source && source.addObserver && !this.sourceConnected) {
				if (!fn) {
					fn = this.sourceObserver = enyo.bindSafely(this, this.syncFromSource);
					fn.binding     = this;
					fn.bindingProp = "source";
				}
				this.sourceConnected = true;
				this.sourceObserver  = source.addObserver(path, fn, null, id);
			} else {
				this.sourceConnected = false;
			}
		},
		connectTarget: function () {
				// the actual target/root object we need to connect to, without this reference
				// or a starting place, we cannot connect
			var target = this.target,
				// the path from the root object leading to the final property (which we will
				// be registering for)
				path   = this.targetGlobal? this.targetProp: this.targetPath,
				// the observer we need to register
				fn     = this.targetObserver,
				id     = this.targetObserverId || (this.targetObserverId=enyo.uid("__bindingObserver__"));
			if (target === enyo.global) {
				target = this.resolve().target;
			}
			if (target && target.addObserver && !this.targetConnected) {
				if (!fn && path) {
					fn = this.targetObserver = enyo.bindSafely(this, this.syncFromTarget);
					fn.binding     = this;
					fn.bindingProp = "target";
				}
				this.targetConnected = true;
				if (path) {
					this.targetObserver  = target.addObserver(path, fn, null, id);
				} else {
					this.registered("target", this.target);
				}
			} else {                      
				this.targetConnected = false;
			}
		},
		disconnectSource: function () {
			if (this.source && this.sourceConnected) {
					// the actual source/root object we need to connect to, without this reference
					// or a starting place, we cannot connect
				var source = this.source,
					// the observer we need to register
					fn     = this.sourceObserver,
					id     = this.sourceObserverId,
					_omap  = enyo._observerMap[source.objectObserverId],
					_e     = _omap && _omap[id];
				if (_e) {
					if (source && source.addObserver && this.sourceConnected) {
						if (fn) {
							source.removeObserver(_e.observerProp, fn);
						}
					}
				}
			}
			this.sourceObserver  = null;
			this.sourceConnected = false;
		},
		disconnectTarget: function () {
			if (this.target && this.targetConnected) {
					// the actual target/root object we need to connect to, without this reference
					// or a starting place, we cannot connect
				var target = this.target,
					// the observer we need to register
					fn     = this.targetObserver,
					id     = this.targetObserverId,
					_omap  = enyo._observerMap[target.objectObserverId],
					_e     = _omap && _omap[id];
				if (_e) {
					if (target && target.addObserver && this.targetConnected) {
						if (fn) {
							target.removeObserver(_e.observerProp, fn);
						}
					}
				}
			}
			this.targetObserver  = null;
			this.targetConnected = false;
		},
		/**
			Retrieving the values actually requires for the ends to have completely
			registered. This ensures we don't have invalid values propagated and/or extra
			work being done too early.
		*/
		getSourceValue: function () {
			var source = this.registeredSource;
			if (source) {
				return source.get(this.sourceProp);
			}
		},
		getTargetValue: function () {
			var target = this.registeredTarget;
			if (target) {
				return target.get(this.targetProp);
			}
		},
		setSourceValue: function (value) {
			var source = this.registeredSource;
			if (source) {
				if (source.destroyed) {
					this.destroy();
					return;
				}
				if (!this.stop) {
					source.set(this.sourceProp, value, !_force.test(typeof value));
				} else {
					this.stop = false;
				}
			}
		},
		setTargetValue: function (value) {
			var target = this.registeredTarget;
			if (target) {
				if (target.destroyed) {
					this.destroy();
					return;
				}
				if (!this.stop) {
					target.set(this.targetProp, value, !_force.test(typeof value));
				} else {
					this.stop = false;
				}
			}
		},
		//*@public
		/**
			Connects the ends (i.e., the _source_ and _target_) of the binding. While
			you typically won't need to call this method, it is safe to call even when
			the ends are already established. Note that if one or both of the ends
			does become connected and the _autoSync_ flag is true, the ends will
			automatically be synchronized. Returns a reference to the binding.
		*/
		connect: function () {
			var c = this.isConnected();
			if (!c) {
				this.connecting = true;
				if (!this.sourceConnected) {
					this.connectSource();
				}
				if (!this.targetConnected) {
					this.connectTarget();
				}
				this.connecting = false;
				this.isConnected();
			}
			if (this.connected && !c && this.autoSync) {
				this.sync();
			}
			return this;
		},
		/**
			Synchronizes values from the _source_ to the _target_. This usually will
			not need to be called manually. Two-way bindings will automatically
			synchronize from the _target_ end once they are connected. Returns a reference
			to the binding.
		*/
		sync: function () {
			if (!this.connecting) {
				this.syncFromSource();
			}
			return this;
		},
		/**
			Disconnects from the ends (i.e., _source_ and _target_) if a connection
			exists at either end. This method will most likely not need to be called
			directly. Returns a reference to the binding.
		*/
		disconnect: function () {
			this.disconnectSource();
			this.disconnectTarget();
			this.isConnected();
			return this;
		},
		/**
			Refreshes the binding, only rebuilding the parts that are missing. Will
			synchronize if it is able to connect and the _autoSync_ flag is true. Returns
			a reference to the binding.
		*/
		refresh: function () {
			this.stop = false;
			this.resolve();
			if (this.autoConnect) {
				this.connect();
			}
			return this;
		},
		/**
			Resets all properties to their original state. Returns a reference to the
			binding.
		*/
		reset: function () {
			this.disconnect();
			enyo.mixin(this, this.originals);
			this.building         = true;
			this.stop             = false;
			this.sourceRegistered = false;
			this.targetRegistered = false;
			this.registeredSource = null;
			this.registeredTarget = null;
			return this;
		},
		/**
			Will cause a single propagation attempt to fail. Typically not called
			outside the scope of a transform.
		*/
		stop: function () {
			this.stop = true;
		},
		/**
			Rebuilds the entire binding. Will synchronize if it is able to connect and
			the _autoSync_ flag is true. Returns a reference to the binding.
		*/
		rebuild: function () {
			return this.reset().refresh();
		},
		/**
			Releases all of the binding's parts and unregisters its observers.
			Typically, this method will not need to be called directly unless the
			binding was created without an owner.
		*/
		destroy: function () {
			this.disconnect();
			this.destroyed        = true;
			this.source           = null;
			this.target           = null;
			this.registeredSource = null;
			this.registeredTarget = null;
			this.sourceObserver   = null;
			this.targetObserver   = null;
			this.transform        = null;
			this.originals        = null;
			if (this.owner) {
				this.owner.removeBinding(this);
				this.owner = null;
			}
			delete _bindingMap[this.id];
			enyo.BindingCount--;
		},
		//*@protected
		initTransform: function () {
			var tf = this.transform,
				o  = this.owner,
				bo = o? o.bindingTransformOwner: null;
			if (tf && enyo.isString(tf)) {
				// test first against the common case which is that it is on the
				// transform owner or the actual owner
				if (bo || o) {
					tf = enyo.getPath.call(bo || o, this.transform);
					// worst case here is to check if there was a bo and that failed if there is an
					// owner go ahead and check that too
					if (!tf && bo && o) {
						tf = enyo.getPath.call(o, this.transform);
					}
				}
				// only if that fails to we attempt to find the global
				if (!tf) { tf = enyo.getPath(this.transform); }
			}
			this.transform = enyo.isFunction(tf)? tf: null;
		}
	});
	/**
		Use this framework property to control the default kind of binding to use
		for all kinds. It may be overridden at the kind level by setting the
		_defaultBindingKind_ property to a different kind of binding.
	*/
	enyo.defaultBindingKind = enyo.Binding;

})(enyo);
