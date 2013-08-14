(function (enyo) {
	
	//*@protected
	// the internal store for bindings so they can be found by id later
	var map = {},
	/**
		Used by the binding's setter for both targets and sources
		when determing whether or not to force a notification to fire.
		We cannot easily determine this for types that are passed
		by reference (e.g. arrays and native JavaScript objects). But
		for these types it much clearer in nearly all cases.
	*/
	_force = /(string|number|boolean)/,
	/**
		Used in macro expansion to determine the macro token unwrapped;
		works in tandem with _enyo.macroize.pattern_ and always assumes
		this is the pattern being used in _binding_ macro support - we
		do not want to have to reset the sticky flag on every execution.
	*/
	_token = /\{\$([^{}]*)\}/;
	
	//*@public
	/**
		A _enyo.Binding_ is used to keep properties synchronized. They can be
		used to link 2 properties on different objects or even the same objects.
		Once a binding has been established it will wait for notification of changes
		and then synchronize the value between its ends. Usually you will not need
		to create an _enyo.Binding_ arbitrarily but instead rely on the public
		_BindingSupport_ API that is applied to _enyo.Object_ and available on all
		subkinds. Also note a _binding_ can be one-way or two-way (one-way by default).
	*/
	enyo.kind({
		name: "enyo.Binding",
		kind: null,
		noDefer: true,
		/**
			The _from_ property designates a path from which the _property_ of the _source_
			to bind from can be found. If the _source_ is explicitly provided and the path
			is relative (beginning with a ".") it is relative to the _source_ otherwise it is
			relative to the _owner_ of the binding. In order to have a binding evaluated from
			the global scope prefix the path with a "^". If the _source_ and the "^" are used in
			tandem the "^" will be ignored and the path will be assumed to be relative from the
			provided _source_.
		*/
		from: "",
		/**
			The _to_ property designates a path from which the _property_ of the _target_
			to bind from can be found. If the _target_ is explicitly provided and the path
			is relative (beginning with a ".") it is relative to the _target_ otherwise it is
			relative to the _owner_ of the binding. In order to have a binding evaluated from
			the global scope prefix the path with a "^". If the _target_ and the "^" are used in
			tandem the "^" will be ignored and the path will be assumed to be relative from the
			provided _target_.
		*/
		to: "",
		/**
			Set this only to a reference for an object to use as the _source_ for the _binding_.
			If this is not a bindable object during initialization the _source_ will be derrived
			from the _from_ property.
		*/
		source: null,
		/**
			Set this only to a reference for an object to use as the _target_ for the _binding_.
			If this is not a bindable object during initialization the _target_ will be derrived
			from the _to_ property.
		*/
		target: null,
		/**
			Set this to a function or the name of a method of the _owner_ of this _binding_. A
			_transform_ method is used to programmatically modify the value being synchronized.
			The method will be executed with three parameters, `value` being synchronized, the
			`direction` (a string matching either "source" or "target" -- think "going to the source")
			and a reference to this binding. In cases where the binding should be interrupted and
			not propagate the synchronization at all call the `stop` method of the passed in _binding_
			reference.
		*/
		transform: "",
		/**
			If the binding was able to resolve both ends (its _target_ and _source_ objects) this
			boolean will be `true`. Setting this manually will have undesirable affects.
		*/
		connected: false,
		/**
			Primarily used internally but useful for debugging this value will be `true` if it needs
			synchronization and `false` if it is synchronized.
		*/
		dirty: true,
		/**
			By default bindings will attempt to expand macroized properties. If you do not use macros
			it may be more efficient to set this flag to `false`, default is `true`. To turn off macro
			expansion for an entire _kind_, simply set the `defaultBindingKind` to `enyo.NoMacroBinding`.
			To turn it off throughout the framework, set `enyo.defaultBindingKind = enyo.NoMacroBinding`.
		*/
		expandMacros: true,
		/**
			Each _binding_ will have a unique _id_ which can be used with the global static
			methid _enyo.Binding.find_ to retrieve a reference to that binding. It can also be used
			to track registered listeners on objects back to their _binding_.
		*/
		id: "",
		/**
			If a binding is one-way this flag should be `true` (default). If this flag is set to
			`false` this binding will be two-way.
		*/
		oneWay: true,
		/**
			By default a _binding_ will attempt to connect to both ends (_source_ and _target_) but
			if that process should be deferred set this flag to `false`.
		*/
		autoConnect: true,
		/**
			By default a _binding_ will attempt to synchronize its values from its _source_ to its
			_target_. If this process should be deferred set this flag to `false`.
		*/
		autoSync: true,
		/**
			The _owner_ property is used extensively for various purposes within a _binding_. The primary
			purposes include a root object from which to search for its ends (_source_ and/or _target_).
			If the _owner_ created the _binding_ then it will also be responsible for destroying the
			_binding_ (automatic).
		*/
		owner: null,
		/**
			Indicator of whether or not this _binding_ has been destroyed. Do not change this flag
			arbitrarily.
		*/
		destroyed: false,
		statics: {
			/**
				This method can be used to retrieve a _binding_ by its id globally. Simply pass the
				known _id_ string. If found it will return the reference to the _binding_, otherwise it
				will return `undefined`.
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
		constructor: function (props) {
			enyo.mixin(this, props);
			this.id = enyo.uid("binding");
			map[this.id] = this;
			this.initTransform();
			this.initPart("from", "source");
			this.initPart("to", "target");
			if (this.autoConnect) {
				this.connect();
			}
		},
		isConnected: function () {
			var c = this.connected = (this._sourceConnected && this._targetConnected);
			return c;
		},
		syncFromSource: function () {
			var val = this.getSourceValue(),
				fn = this.transform,
				o = this.owner;
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
				fn = this.transform,
				o = this.owner;
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
		initRoot: function (part, root) {
			var p = this[root],
				e = this.expandMacros,
				o = this.owner, r;
			// this resolving algorithm is only active if the root has not yet
			// been resolved
			if (enyo.isString(p)) {
				if (e) { p = this._expandMacro(root, p); }
				var i = p[0];
				// or we fall back on normal handling as long as the string isn't a macro
				// that couldn't be resolved
				if (i != "." && i != "^") {
					return enyo.error("enyo.Binding: the `" + root + "` as a path must begin with " +
						"`.` or `^` to signify relativity of the part");
				}
				i = (i == "."? true: false);
				r = enyo.getPath.call(i? this.owner: enyo.global, p);
				if (!r) {
					// if this doesn't work then it was designed incorrectly and will
					// fail like it should
					this["_" + root + "Path"] = i? p.slice(1): p;
				}
				if (r || (p && p != this[root])) { this[root] = r || p; }
			}
		},
		initPart: function (part, root) {
			if (!this[part]) { return; }
			var e = this.expandMacros,
				p$ = this[part],
				rh = "_" + root + "Path",
				rp = "_" + root + "Property", i, parts;
			// try and handle macro expansion early if possible
			if (e) {
				var r = this._expandMacro(part, p$);
				if (r && r != p$) { p$ = this[part] = r; }
			}
			this.initRoot(part, root);
			p$ = p$.slice(1);
			// the initial character must be . or ^
			i = this[part][0];
			parts = p$.split(".");
			// if it isn't, we error so the developer can identify the issue
			if (i != "." && i != "^" && e && i != "{") {
				return enyo.error("enyo.Binding: binding `" + part + "` path must begin with `^` or `.` to signify " +
					"relativity of the path");
			}
			
			i = (i == "."? true: false);
			// if it is a relative path but we have no root or owner
			// then we know we can't find it
			if (i && !(this[root] || this.owner)) { return; }
			// if there is no root or known/derived path we
			// find the path and attempt to locate the root from that
			if (!this[root] && !this[rh]) {
				var p = parts.slice(0, -1).join(".");
				// now we attempt to retrieve the source from this information
				this[root] = enyo.getPath.call(i? this.owner: enyo.global, p);
				this[rh] = p;
			}
			// if we don't have a root but we've already found our path then we should
			// be able to quickly try and find the root again
			else if (!this[root] && this[rh]) {
				this[root] = enyo.getPath.call(i? this.owner: enyo.global, this[rh]);
			}
			// if we don't know our actual root property to bind on we
			// grab that as well
			if (!this[rp]) {
				this[rp] = parts.pop();
			}
		},
		_expandMacro: function (prop, macro) {
			if (!macro) { return; }
			var o = this.owner,
				ms, m, ex, r;
			// we hate to run this test unnecessarily but the overhead we'll
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
						// this will either be expanded or the same thing, its a
						// safe execution
						m[r] = o._bindingExpandMacro(ex, r, macro, prop, this);
					}
					if (!m[r] || m[r] == r) {
						// this is most likely a local property someone is short-cutting by
						// the convention of their naming scheme so we test for the existence
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
			var src = this.source,
				prop = this._sourceProperty,
				fn = this._sourceObserver;
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
			var tar = this.target,
				prop = this._targetProperty,
				fn = this._targetObserver;
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
			var src = this.source,
				prop = this._sourceProperty,
				fn = this._sourceObserver;
			if (src && fn) {
				src.removeObserver(prop, fn);
			}
			this._sourceConnected = false;
		},
		disconnectTarget: function () {
			var tar = this.target,
				prop = this._targetProperty,
				fn = this._targetObserver;
			if (tar && fn) {
				tar.removeObserver(prop, fn);
			}
			this._targetConnected = false;
		},
		getSourceValue: function () {
			var src = this.source,
				prop = this._sourceProperty;
			return src.get(prop);
		},
		getTargetValue: function () {
			var tar = this.target,
				prop = this._targetProperty;
			return tar.get(prop);
		},
		setSourceValue: function (value) {
			var src = this.source,
				prop = this._sourceProperty,
				fc = !_force.test(typeof value);
			if (!src || src.destroyed) {
				this.destroy();
				return;
			}
			src.set(prop, value, fc);
		},
		setTargetValue: function (value) {
			var tar = this.target,
				prop = this._targetProperty,
				fc = !_force.test(typeof value);
			if (!tar || tar.destroyed) {
				this.destroy();
				return;
			}
			tar.set(prop, value, fc);
		},
		//*@public
		/**
			This method is used to connect the ends (_source_ and _target_) of
			the _binding_. While typically you won't need to call this method it
			can safely be called even when the ends are already established. Note that
			if one or both of the ends does become connected and the `autoSync` flag
			is `true`, it will automatically be synchronized.
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
			This method will synchronize values from the _source_ to the _target_. This
			usually will not need to be called manually. For two-way bindings they will
			automatically synchronize from the _target_ end once they are connected.
		*/
		sync: function () {
			if (this.connected) {
				this.syncFromSource();
			}
		},
		/**
			This method will disconnect from its ends (_source_ and _target_) if
			it is _connected_ at either end. This method will most likely not need to
			be called manually.
		*/
		disconnect: function () {
			this.disconnectSource();
			this.disconnectTarget();
			this.isConnected();
		},
		/**
			Refresh the binding only rebuilding the parts that are missing. Will synchronize
			if it is able to connect and the `autoSync` flag is true.
		*/
		refresh: function () {
			this.initPart("from", "source");
			this.initPart("to", "target");
			this.connect();
		},
		/**
			Rebuild the entire binding. Will synchronize if it is able to connect and the `autoSync`
			flag is true.
		*/
		rebuild: function () {
			this.source = null;
			this.target = null;
			this._sourceProperty = null;
			this._targetProperty = null;
			this.refresh();
		},
		/**
			This method is used to release all of its parts and unregister its observers.
			Typically this method does not need to be called manually (unless created
			without an owner).
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
				this.owner =  null;
			}
			delete map[this.id];
		},
		/**
			This is the method that will interrupt the binding if called from within
			the scope of a transform. Do not call this method otherwise.
		*/
		stop: function () {
			throw "binding-top";
		},
		//*@protected
		initTransform: function () {
			var tf = this.transform,
				o = this.owner,
				bo = o? o._bindingTransformOwner: null;
			if (tf && enyo.isString(tf)) {
				tf = (bo || o? enyo.getPath.call(bo || o, tf): enyo.getPath(tf));
			}
			this.transform = enyo.isFunction(tf)? tf: null;
		}
	});
	/**
		Use this framework property to control the default _kind_ of binding to
		use for all _kinds_. It may be overridden at the _kind_ level if their
		`defaultBindingKind` property is set to a different _kind_ of _binding_.
	*/
	enyo.defaultBindingKind = enyo.Binding;
	
})(enyo);
