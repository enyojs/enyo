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
		_force = /(string|number|boolean)/;
	
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
		/**
			When creating a binding set this string to the path of the _source_ end
			and bindable property. If providing the _source_ property separately simply
			set this to the property path relative to the _source_. If the string is
			prefixed with a "." it is assumed to be relative from the _owner_ should it
			exist or the global scope otherwise. When there is no _source_ property and this
			string only has one part the _source_ of the property will be assumed to be the
			_owner_.
		*/
		from: "",
		/**
			When creating a binding set this string to the path of the _target_ end and
			bindable property. If providing the _target_ property separately simply set this
			to the property path relative to the _target_. If the string is prefixed with a "."
			it is assumed to be relative from the _owner_ should it exist or the global scope
			otherwise. When there is no _target_ property and this string only has one part
			the _target_ of the property will be assumed to be the _owner_.
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
			this.initSource();
			this.initTarget();
			if (this.autoConnect) {
				this.connect();
			}
		},
		isConnected: function () {
			return this.connected = (this._sourceConnected && this._targetConnected);
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
		initSource: function () {
			var src = this.source,
				fr = this.from,
				o = this.owner,
				prop = this._sourceProperty,
				loc = fr[0] === ".",
				path = this._sourcePath,
				pr = (loc? fr.slice(1): fr).split(".");
			if (!src && !path) {
				path = pr.slice(0,-1).join(".");
				if (loc) {
					if (o) {
						src = enyo.getPath.call(o, path);
					}
				} else {
					src = enyo.getPath(path);
				}
			} else if (!src && path) {
				src = enyo.getPath.call(o || enyo.global, path);
			}
			if (!prop) {
				prop = pr.pop();
			}
			this._sourceProperty = prop;
			this._sourcePath = path;
			this.source = src;
		},
		initTarget: function () {
			var tar = this.target,
				to = this.to,
				o = this.owner,
				prop = this._targetProperty,
				loc = to[0] === ".",
				path = this._targetPath,
				pr = (loc? to.slice(1): to).split(".");
			if (!tar && !path) {
				path = pr.slice(0,-1).join(".");
				if (loc) {
					if (o) {
						tar = enyo.getPath.call(o, path);
					}
				} else {
					tar = enyo.getPath(path);
				}
			} else if (!tar && path) {
				tar = enyo.getPath.call(o || enyo.global, path);
			}
			if (!prop) {
				prop = pr.pop();
			}
			this._targetProperty = prop;
			this._targetPath = path;
			this.target = tar;
		},
		connectSource: function () {
			var src = this.source,
				prop = this._sourceProperty,
				fn = this._sourceObserver;
			if (src && prop) {
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
			if ((tar && prop) || (this.oneWay && tar)) {
				if (this.oneWay) {
					this._targetConnected = true;
				} else {
					if (!fn) {
						fn = enyo.bind(this, this.syncFromTarget);
						fn.id = this.id;
						this._targetObserver = fn;
					}
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
			src.set(prop, value, fc);
		},
		setTargetValue: function (value) {
			var tar = this.target,
				prop = this._targetProperty,
				fc = !_force.test(typeof value);
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
			this.initSource();
			this.initTarget();
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
			if (this.transform) {
				this.transform.destroy();
				this.transform = null;
			}
			if (this.owner) {
				this.owner.removeBinding(this);
				this.owner =  null;
			}
			delete map[this.id];
		},
		stop: function () {
			throw "binding-top";
		},
		//*@protected
		initTransform: function () {
			var tf = this.transform;
			if (tf && enyo.isString(tf)) {
				tf = enyo.getPath.call(this.owner, tf);
			}
			this.transform = enyo.isFunction(tf)? tf: null;
		}
	});
	
})(enyo);
