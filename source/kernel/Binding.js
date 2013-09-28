(function (enyo) {

	//*@protected
	// The internal store for bindings so they can be found by id later
	var map = {},
	/**
		Used by the binding's setter for both targets and sources
		when determing whether or not to force a notification to fire.
		We cannot easily determine this for types that are passed
		by reference (e.g., arrays and native JavaScript objects). But
		for these types it is much clearer in nearly all cases.
	*/
	_force = /(string|number|boolean)/,
	/**
		Used in macro expansion to determine the macro token unwrapped;
		works in tandem with _enyo.macroize.pattern_ and always assumes
		this is the pattern being used in binding macro support--we
		do not want to have to reset the sticky flag on every execution.
	*/
	_token = /\{\$([^{}]*)\}/;
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
			This value will be true if the binding needs synchronization and false if
			it does not. While it is primarily for internal use, this property may
			also be useful for debugging.
		*/
		dirty: true,
		/**
			By default, bindings will attempt to expand macroized properties. If you
			do not use macros, it may be more efficient to set this flag to false (the
			default is true). To turn off macro expansion for an entire kind, set its
			_defaultBindingKind_ to _enyo.NoMacroBinding_; to turn it off throughout
			the framework, set _enyo.defaultBindingKind = enyo.NoMacroBinding_.
		*/
		expandMacros: true,
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
				return map[id];
			}
		},
		//*@protected
		_sourceProperty: "",
		_targetProperty: "",
		_sourcePath: "",
		_targetPath: "",
		_sourceObserver: null,
		_targetObserver: null,
		_sourceConnected: false,
		_targetConnected: false,
		_rebuildSource: true,
		_rebuildTarget: true,
		constructor: function (props) {
			if (props) { enyo.mixin(this, props); }
			this.id = enyo.uid("binding");
			map[this.id] = this;
			this.initTransform();
			this.refresh();
			enyo.BindingCount++;
		},
		isConnected: function () {
			var c = this.connected = (this._sourceConnected && this._targetConnected);
			return c;
		},
		syncFromSource: function () {
			var val = this.getSourceValue(),
				fn  = this.transform,
				o   = this.owner;
			if (fn && enyo.isFunction(fn)) {
				try {
					val = fn.call(o || this, val, "source", this);
				} catch (e) {
					// catch the known error and return having been interrupted
					if (e === "binding-stop") {
						return;
					}
					// otherwise we release the error so as not to silence
					// something else
					throw e;
				}
			}
			if (!this.oneWay) {
				this.disconnectTarget();
			}
			this.setTargetValue(val);
			if (!this.oneWay) {
				this.connectTarget();
			}
		},
		syncFromTarget: function () {
			var val = this.getTargetValue(),
				fn  = this.transform,
				o   = this.owner;
			if (fn && enyo.isFunction(fn)) {
				try {
					val = fn.call(o || this, val, "target", this);
				} catch (e) {
					if (e === "binding-stop") {
						return;
					}
					throw e;
				}
			}
			this.disconnectSource();
			this.setSourceValue(val);
			this.connectSource();
		},
		_resolve: function (base, path) {
			// three paths, we have the base resolved already, we have a base that is
			// a string, or no base and we have to determine it from the path
			var b  = this[base],
				p  = this[path],
				e  = this.expandMacros,
				o  = this.owner,
				bp = "_" + base + "Path",
				b$ = this[bp],
				pp = "_" + base + "Property",
				p$ = this[pp],
				bf = "_" + base + "From",
				f$ = this[bf], i;
			if (!p) { return; }
			if (enyo.isString(b)) {
				// if its a string we will let the path resolver handle it all as if it were
				// the third case
				this[path] = p = (b + "." + p).replace(/\.+/g, ".");
				this[base] = b = null;
			}
			// we attempt to shortcut this method here so we don't do unnecessary work
			// multiple times over the life of the binding
			if (!(enyo.isString(b$) && p$)) {
				// we need to verify that the path is of the correct form and expand any
				// macros that might have been used
				if (e) { p = this[path] = this._expandMacro(path, p); }
				var parts = p.slice(1).split(".");
				// verify we know if this is relative or not and decide what we can do with
				// the information we have
				if ((i=p[0]) && i != "." && i != "^") {
					throw "enyo.Binding: binding `" + path + "` path must begin with `^` or `.` to signify " +
						"relativity of the path";
				} else { i = (i == "."); } // gives us a boolean for relativity
				if (i && !(o || b)) {
					throw "enyo.Binding: relative path requested for an un-owned binding";
				}
				// first we can determine the final property from the path
				if (!p$) { p$ = parts.pop(); }
				// finding the path to the root here is a bit tricky in some cases because of the
				// allowed mixing of specified information
				if (b) {
					// if we were handed the root as an object then we won't be able to resolve it
					// again in the future so we set this flag so subsequent calls to rebuild the binding
					// won't remove it
					this["_rebuild" + enyo.cap(base)] = false;
				}
				// this will be a lengthless string if there is no additional path information
				// we can derive
				b$ = parts.shift() || "";
				f$ = parts.join(".");
			} else { i = (p[0] == "."); }
			// if we need to resolve the root we're working on we attempt to do that now
			b = b || (!b$ && (b || (i && o))) || (b$? enyo.getPath.call(b || (i? o: enyo.global), b$): null);
			// this can only happen if we just now found the base otherwise it will
			// happen relative to the base we already found and that is not correct
			if (b && !this[base]) {
				if (f$) {
					b = enyo.getPath.call(b, f$);
				}
			}
			// now store these values for later reuse and so we don't need to resolve them again
			this[base] = b;
			this[bp]   = b$;
			this[bf]   = f$;
			this[pp]   = p$;
		},
		_expandMacro: function (prop, macro) {
			if (!macro) { return; }
			var o = this.owner,
				ms, m, ex, r;
			// we hate to run this test unnecessarily, but the overhead we'll
			// save by this test outweighs the cons
			ms = macro.match(enyo.macroize.pattern);
			if (ms) {
				m = {};
				for (var i=0, e; (e=ms[i]); ++i) {
					// retrieve the original macro and its extracted token for
					// custom mapping
					e = _token.exec(e);
					r = e[0];
					ex = e[1];
					if (o) {
						// this will either be expanded or the same thing; it's a
						// safe execution
						m[r] = o._bindingExpandMacro(ex, r, macro, prop, this);
					}
					if (!m[r] || m[r] == r) {
						// this is most likely a local property someone is short-cutting by
						// the convention of their naming scheme, so we test for the existence
						// and validity of the property
						if (this[ex] && enyo.isString(this[ex])) {
							m[r] = this[ex];
						}
						// otherwise we ignore it because its invalid
					}
				}
				// now we should have been able to expand any custom-added macros
				// (usually meta properties to shortcut a different dynamic path)
				// so we need to try and macroize the entire path now
				return enyo.quickReplace(macro, m);
			}
			return macro;
		},
		connectSource: function () {
			var src  = this.source,
				prop = this._sourceProperty,
				fn   = this._sourceObserver;
			if (!enyo.isString(src) && src && prop && !src.prototype) {
				if (!fn) {
					fn = enyo.bind(this, this.syncFromSource);
					fn.id = this.id;
					this._sourceObserver = fn;
				}
				src.addObserver(prop, fn);
				this._sourceConnected = true;
			} else {
				this._sourceConnected = false;
			}
		},
		connectTarget: function () {
			var tar  = this.target,
				prop = this._targetProperty,
				fn   = this._targetObserver;
			if (!enyo.isString(tar) && tar && prop && !tar.prototype) {
				if (this.oneWay) {
					this._targetConnected = true;
				} else {
					if (!fn) {
						fn = enyo.bind(this, this.syncFromTarget);
						fn.id = this.id;
						this._targetObserver = fn;
					}
					tar.addObserver(prop, fn);
					this._targetConnected = true;
				}
			} else {
				this._targetConnected = false;
			}
		},
		disconnectSource: function () {
			var src  = this.source,
				prop = this._sourceProperty,
				fn   = this._sourceObserver;
			if (src && fn) {
				src.removeObserver(prop, fn);
			}
			this._sourceConnected = false;
		},
		disconnectTarget: function () {
			var tar  = this.target,
				prop = this._targetProperty,
				fn   = this._targetObserver;
			if (tar && fn) {
				tar.removeObserver(prop, fn);
			}
			this._targetConnected = false;
		},
		getSourceValue: function () {
			var src  = this.source,
				prop = this._sourceProperty;
			return src.get(prop);
		},
		getTargetValue: function () {
			var tar  = this.target,
				prop = this._targetProperty;
			return tar.get(prop);
		},
		setSourceValue: function (value) {
			var src  = this.source,
				prop = this._sourceProperty,
				fc   = !_force.test(typeof value);
			if (!src || src.destroyed) {
				this.destroy();
				return;
			}
			src.set(prop, value, fc);
		},
		setTargetValue: function (value) {
			var tar  = this.target,
				prop = this._targetProperty,
				fc   = !_force.test(typeof value);
			if (!tar || tar.destroyed) {
				this.destroy();
				return;
			}
			tar.set(prop, value, fc);
		},
		//*@public
		/**
			Connects the ends (i.e., the _source_ and _target_) of the binding. While
			you typically won't need to call this method, it is safe to call even when
			the ends are already established. Note that if one or both of the ends
			does become connected and the _autoSync_ flag is true, the ends will
			automatically be synchronized.
		*/
		connect: function () {
			var c = this.isConnected();
			if (!c) {
				if (!this._sourceConnected) {
					this.connectSource();
				}
				if (!this._targetConnected) {
					this.connectTarget();
				}
				this.isConnected();
			}
			if (this.connected && !c && this.autoSync) {
				this.sync();
			}
		},
		/**
			Synchronizes values from the _source_ to the _target_. This usually will
			not need to be called manually. Two-way bindings will automatically
			synchronize from the _target_ end once they are connected.
		*/
		sync: function () {
			if (this.connected) {
				this.syncFromSource();
			}
		},
		/**
			Disconnects from the ends (i.e., _source_ and _target_) if a connection
			exists at either end. This method will most likely not need to be called
			directly.
		*/
		disconnect: function () {
			this.disconnectSource();
			this.disconnectTarget();
			this.isConnected();
		},
		/**
			Refreshes the binding, only rebuilding the parts that are missing. Will
			synchronize if it is able to connect and the _autoSync_ flag is true.
		*/
		refresh: function () {
			for (var i=0, ops=[["source","from"],["target","to"]], p; (p=ops[i]); ++i) {
				this._resolve.apply(this, p);
			}
			if (this.autoConnect) { this.connect(); }
		},
		/**
			Rebuilds the entire binding. Will synchronize if it is able to connect and
			the _autoSync_ flag is true.
		*/
		rebuild: function () {
			this.source = this._rebuildSource? null: this.source;
			this.target = this._rebuildTarget? null: this.target;
			this.refresh();
		},
		/**
			Releases all of the binding's parts and unregisters its observers.
			Typically, this method will not need to be called directly unless the
			binding was created without an owner.
		*/
		destroy: function () {
			this.destroyed = true;
			this.disconnect();
			this.source = null;
			this.target = null;
			this._sourceObserver = null;
			this._targetObserver = null;
			this.transform = null;
			if (this.owner) {
				this.owner.removeBinding(this);
				this.owner = null;
			}
			delete map[this.id];
			enyo.BindingCount--;
		},
		/**
			Interrupts the binding if called from within the scope of a transform. Do
			not call this method otherwise.
		*/
		stop: function () {
			throw "binding-stop";
		},
		//*@protected
		initTransform: function () {
			var tf = this.transform,
				o  = this.owner,
				bo = o? o._bindingTransformOwner: null;
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
