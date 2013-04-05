(function () {

	//*@protected
	/**
		Used internally to track bindings.
	*/
	var map = {};

	//*@protected
	/**
		Used internally to track references to bindings to allow for
		several different events to occur that will still cleanup
		bindings.
	*/
	var register = function (binding) {
		map[binding.id] = binding;
		binding._registered = true;
	};

	//*@protected
	/**
		Used internally to remove references to bindings.
	*/
	var unregister = function (id) {
		id = id && id.id? id.id: id;
		if (map[id]) {
			delete map[id];
		}
	};

	//*@protected
	var count = 0;

	//*@protected
	/**
		Used internally as part of the getParts method.
	*/
	var fromRoot = function (root, parts) {
		// check to see if the part of the path is relative to the root
		var piece = root[(parts || [])[0]];
		// if the root here is enyo.global then we need to ensure that
		// the piece is actually an object
		// this is very, very important
		if (enyo.exists(piece)) {
			if (enyo.global === root) {
				return "object" === typeof piece? root: undefined;
			} else {
				return root;
			}
		}
	};

	//*@protected
	/**
		Used internally to determine from the given information what the
		source and target paths and properties are. There is one exception case
		between determining parts for the source and the target in bindings so
		the optional third parameter helps it to use the correct algorithm.
	*/
	var getParts = function (path, context) {
		/* jshint debug: true */
		if (this.debug) {
			debugger;
		}
		var parts;
		var idx = 0;
		var ret = {};
		var root;
		var cur;
		var prop;
		var base;
		var part;
		var owner = this.owner;
		var local = path[0] === "."? true: false;
		path = path[0] === "."? path.slice(1): path;
		parts = path.split(".");
		root = local? context || owner: context || fromRoot(enyo.global, parts) || owner;
		base = root;
		ret.property = prop = parts.length > 1? parts.pop(): path;
		if (prop === path || (!local && context)) {
			ret.base = base;
		} else {
			cur = base;
			for (; idx < parts.length; ++idx) {
				part = parts[idx];
				if (!part) {
					continue;
				}
				cur = cur[part];
				if (!cur || "string" === typeof cur) {
					if (part !== prop) {
						ret.base = null;
					}
					return ret;
				}
			}
			if (part !== path) {
				base = cur;
			}
			ret.base = base;
		}
		return ret;
	};

	//*@protected
	/**
		Initially called during construction to setup the properties
		of the binding appropriately exiting on specific conditions
		silently if the target or source could not be properly
		determined or found.
	*/
	var setup = function () {
		/* jshint debug: true */
		var debug = this.debug;
		// for browsers that support this kind of debugging
		if (true === debug) {
			debugger;
		}
		// register the binding globally for cleanup purposes
		var connect = this.autoConnect;
		var sync = this.autoSync;
		var source = this.setupSource();
		var target = this.setupTarget();
		var refreshing = this._refreshing;
		if (!this._registered) register(this);
		// setup the transform if we can
		if (true !== refreshing) {
			this.setupTransform();
		}
		// if we are refreshing and cannot find
		// one of these parts we need to reset the targets
		// value if possible (happens frequently in proxy/model-
		// controllers who's model has been set to null)
		if (!(source && target)) {
			if (refreshing) {
				if (target) {
					// set the target's value to null to let
					// it know we can't sync the real value from
					// the source
					this.setTargetValue(null);
				}
			}
			return;
		}
		// this will fail silently if setup went aury for
		// either the target or source
		// we allow the process of connecting the ends to be
		// interrupted if either end has been destroyed, we
		// self-destruct
		try {
			if (connect || refreshing) {
				this.connect();
			}
		} catch (err) {
			if ("binding-destroyed" === err) {
				return;
			}
			else {
				throw err;
			}
		}
		if (sync || refreshing) {
			this.sync();
		}
	};

	//*@protected
	function Transform (fn, binding) {
		this.transformer = fn;
		this.binding = binding;
	}

	//*@protected
	Transform.prototype = {
		transform: function (value, direction) {
			var fn = this.transformer;
			var binding = this.binding;
			var context = binding.owner || enyo.global;
			return fn.call(context, value, direction, binding);
		},
		destroy: function () {
			this.transformer = null;
			this.binding = null;
		}
	};

	//*@public
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.Binding",

		//*@public
		kind: null,

		//*@public
		source: null,

		//*@public
		target: null,

		//*@public
		to: null,

		//*@public
		from: null,

		//*@public
		autoConnect: true,

		//*@public
		autoSync: true,

		//*@public
		owner: null,

		//*@public
		transform: null,

		//*@public
		oneWay: true,

		//*@public
		twoWay: false,

		//*@public
		destroyed: false,

		//*@public
		debug: false,

		//*@public
		statics: {
			find: function (id) {
				return map[id];
			}
		},

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_source_property: null,

		//*@protected
		_target_property: null,

		//*@protected
		_source_responder: null,

		//*@protected
		_target_responder: null,

		//*@protected
		_is_connected: false,

		//*@protected
		_synchronizing: false,

		//*@protected
		_refreshing: false,
		
		//*@protected
		_registered: false,

		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS

		// ...........................
		// PROTECTED METHODS

		//*@protected
		sync: function () {
			if (true === this._is_connected) {
				this.syncFromSource();
			}
		},

		//*@protected
		refresh: function () {
			this._refreshing = true;
			setup.call(this);
			this._refreshing = false;
		},

		//*@public
		/**
			Call this method to connect this binding to its
			source (and target). This only registers the responders
			but does not automatically synchronize the values.
		*/
		connect: function () {
			if (true === this._is_connected) {
				return;
			}
			if (true === this.destroyed) {
				return;
			}
			this.connectSource();
			this.connectTarget();
			if (this.sourceConnected && this.targetConnected) {
				this._is_connected = true;
			} else {
				this._is_connected = false;
			}
		},

		//*@public
		/**
			Call this method to disconnect this binding from
			its source (and target).
		*/
		disconnect: function () {
			if (false === this._is_connected) {
				return;
			}
			this.disconnectSource();
			this.disconnectTarget();
			this._is_connected = false;
		},

		//*@protected
		setupSource: function () {
			var parts;
			var base;
			var property = this._source_property;
			var source = this.source;
			var from = this.from;
			if (source && property) {
				return true;
			}
			if (!from) {
				return false;
			}
			parts = getParts.call(this, from, source);
			base = parts.base;
			property = parts.property;
			if (!base || "object" !== typeof base) {
				return false;
			}
			this.source = base;
			this._source_property = property;
			return true;
		},

		//*@protected
		setupTarget: function () {
			var parts;
			var base;
			var property = this._target_property;
			var target = this.target;
			var to = this.to;
			if (target && property) {
				return true;
			}
			if (!to) {
				return false;
			}
			parts = getParts.call(this, to, target);
			base = parts.base;
			property = parts.property;
			if (!base || "object" !== typeof base) {
				return false;
			}
			this.target = base;
			this._target_property = property;
			return true;
		},

		//*@protected
		stop: function () {
			throw "stop-binding";
		},

		//*@protected
		connectSource: function () {
			var source = this.source;
			var property = this._source_property;
			var fn = this._source_responder;
			if (!(source instanceof enyo.Object)) {
				this.sourceConnected = false;
				return false;
			}
			// only create the responder if it doesn't already exist
			if (!enyo.exists(fn) || "function" !== typeof fn) {
				fn = enyo.bind(this, this.syncFromSource);
				this._source_responder = fn;
			}
			// in the event that the source actually exists but has been destroyed
			if (true === source.destroyed) {
				// we need to be destroyed so we can also be cleaned up
				this.destroy();
				throw "binding-destroyed";
			}
			// if it is already connected don't do anything
			if (true === this.sourceConnected) {
				return true;
			}
			if (!enyo.exists(source)) {
				this.sourceConnected = false;
				return false;
			}
			// assign the binding's id to the responder for debugging
			fn.bindingId = this.id;
			// add the observer for the property on the source object
			source.addObserver(property, fn);
			this.sourceConnected = true;
			return true;
		},

		//*@protected
		connectTarget: function () {
			var target = this.target;
			var property = this._target_property;
			var fn = this._target_responder;
			var oneWay = this.oneWay;
			if (!(target instanceof enyo.Object)) {
				this.targetConnected = false;
				return false;
			}
			// in the event that the target actually exists but has been destroyed
			if (true === target.destroyed) {
				// we need to be destroyed so we can also be cleaned up
				this.destroy();
				throw "binding-destroyed";
			}
			// if this is a one way binding there is nothing to do
			if (true === oneWay) {
				this.targetConnected = true;
				return true;
			}
			// only create the responder if it doesn't already exist
			if (!enyo.exists(fn) || "function" !== typeof fn) {
				fn = enyo.bind(this, this.syncFromTarget);
				this._target_responder = fn;
			}
			// if it is already connected don't do anything else
			if (true === this.targetConnected) {
				return true;
			}
			if (!enyo.exists(target)) {
				this.targetConnected = false;
				return false;
			}
			fn.bindingId = this.id;
			target.addObserver(property, fn);
			this.targetConnected = true;
			return true;
		},

		//*@protected
		syncFromSource: function () {
			var twoWay = this.twoWay;
			var value = this.getSourceValue();
			var transformer = this.transform;
			// if this is a two way binding we need to
			// disconnect from the target first to ensure
			// we don't catch the update response
			// TODO: rethink this approach as try/catch are
			// costly in general...
			try {
				value = transformer.transform(value, "source");
			} catch (err) {
				// the transform was interrupted, do not complete
				if ("stop-binding" === err) {
					return;
				} else {
					throw err;
				}
			}
			if (twoWay) {
				this._synchronizing = true;
				this.disconnectTarget();
			}
			this.setTargetValue(value);
			if (twoWay) {
				this.connectTarget();
				this._synchronizing = false;
			}
		},

		//*@protected
		syncFromTarget: function () {
			var value = this.getTargetValue();
			var transformer = this.transform;
			// TODO: same as for syncFromSource
			try {
				value = transformer.transform(value, "target");
			} catch (err) {
				// the transform was interrupted, do not complete
				if ("stop-binding" === err) {
					return;
				} else {
					throw err;
				}
			}
			this.disconnectSource();
			this.setSourceValue(value);
			this.connectSource();
		},

		//*@protected
		disconnectSource: function () {
			var source = this.source;
			var property = this._source_property;
			var fn = this._source_responder;
			if (!enyo.exists(source)) {
				return;
			}
			source.removeObserver(property, fn);
			this.sourceConnected = false;
		},

		//*@protected
		disconnectTarget: function () {
			var target = this.target;
			var fn = this._target_responder;
			var property = this._target_property;
			if (!enyo.exists(target)) {
				return;
			}
			if ("function" === typeof fn) {
				target.removeObserver(property, fn);
			}
			this.targetConnected = false;
		},

		//*@protected
		setSourceValue: function (value) {
			var source = this.source;
			var property = this._source_property;
			source.set(property, value, true);
		},

		//*@protected
		setTargetValue: function (value) {
			var target = this.target;
			var property = this._target_property;
			target.set(property, value, true);
		},

		//*@protected
		getSourceValue: function () {
			var source = this.source;
			var property = this._source_property;
			return source.get(property);
		},

		//*@protected
		getTargetValue: function () {
			var target = this.target;
			var property = this._target_property;
			return target.get(property);
		},

		//*@protected
		setupTransform: function () {
			var transform = this.transform;
			var owner = this.owner || {};
			// if it is a string we try and locate it on the owner
			// or as a global method
			if ("string" === typeof transform) {
				transform = owner[transform] || enyo.getPath.call(owner, transform)
					|| enyo.getPath.call(enyo.global, transform);
			}
			// if we couldn't find anything go ahead and setup a default
			// to simply return the value
			if ("function" !== typeof transform) {
				transform = this.transform = function(value) {
					return value;
				};
			}
			if (!(transform instanceof Transform)) {
				this.transform = new Transform(transform, this);
			}
		},

		//*@public
		/**
			Call this method to prepare this object to be
			cleaned up by the garbage collector.
		*/
		destroy: function () {
			if (true === this.destroyed) {
				return;
			}
			// we set this right away so that we don't wind up
			// in an infinite loop
			this.destroyed = true;
			this.disconnect();
			this.source = null;
			this.target = null;
			this._source_responder = null;
			this._target_responder = null;
			enyo.Binding.bindingCount--;
			if (this.transform) {
				this.transform.destroy();
				this.transform = null;
			}
			if (this.owner) {
				this.owner.removeBinding(this);
			}
			// make sure to unregister the binding reference
			unregister(this);
		},

		//*@protected
		constructor: function () {
			var idx = 0;
			var len = arguments.length;
			var oneWay;
			var twoWay;
			// increment our binding counter for debugging purposes
			count++;
			// take any properties that were passed in and apply them
			// to this binding instance
			for (; idx < len; ++idx) {
				enyo.mixin(this, arguments[idx]);
			}
			// generate a new id for this binding
			this.id = enyo.uid("binding");
			// we need to make sure the binding's setup understands if
			// this is a one-way or two-way binding
			oneWay = this.oneWay;
			twoWay = this.twoWay;
			// regardless of what the oneWay flag is set to, priority
			// resolution defers to the twoWay flag initially
			if (true === twoWay) {
				this.oneWay = false;
			}
			// now we check our deferred flag to see if this is a two-way
			// binding having been set via the oneWay flag
			else if (false === oneWay) {
				this.twoWay = true;
			}
			// run our initialization routines
			setup.call(this);
		}

		// ...........................
		// OBSERVERS

	});

}());
