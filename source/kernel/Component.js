/**
	_enyo.Component_ is the fundamental building block for Enyo applications.
	Components are designed to fit together, allowing complex behaviors to be
	fashioned from smaller bits of functionality.

	Component constructors take a single argument (sometimes called a
	_Component configuration_), a JavaScript object that defines various
	properties to be initialized on the Component. For example:

		// create a new component, initialize its name property to 'me'.
		var c = new enyo.Component({
			name: "me"
		});

	When a Component is instantiated, items configured in its _components_
	property are instantiated, too:

		// create a new component, which itself has a component
		var c = new enyo.Component({
			name: "me",
			components: [
				{kind: "Component", name: "other"}
			]
		});

	In this case, when _me_ is created, _other_ is also created, and we say that
	_me owns other_. In other words, the _owner_ property of _other_ equals
	_me_. Notice that you can specify the _kind_ of _other_ explicitly in its
	configuration block, to tell _me_ what constructor to use to create _other_.

	Note that _kind_ values may be references to actual kinds or string-names of
	kinds. Kind names that	do not resolve directly to kinds are looked up in
	default namespaces. In this case, _kind: "Component"_ resolves to
	_enyo.Component_.

	To move a component, use the _setOwner_ method to change the component's owner.
	If you want to make a component unowned, use _setOwner(null)_.

	If you make changes to _enyo.Component_, be sure to add or update the
	appropriate [unit tests](https://github.com/enyojs/enyo/tree/master/tools/test/core/tests).

	For more information, see the documentation on
	[Components](key-concepts/creating-components.html)	in the Enyo Developer
	Guide.
*/
enyo.kind({
	name: "enyo.Component",
	kind: "enyo.Object",
	published: {
		/**
			A unique name for the component within its owner. This is used to
			set the access name in the owner's _$_ hash.  If not specified, a
			default name will be provided based on the name of the object's
			kind, optionally with a number suffix if more than one instance
			exists in the owner.
		*/
		name: "",
		/**
			A unique id for the component, usually automatically generated based
			on its position within the component hierarchy, although it may also
			be directly specified. _enyo.Control_ uses this id value for the DOM
			id attribute.
		*/
		id: "",
		/**
			The component that owns this component. It is usually implicitly
			defined during creation based on the _createComponent_ call or
			_components_ hash.
		*/
		owner: null,
		/**
			This can be a hash of features to apply to chrome components of the base
			kind. They are matched by _name_ (if the component you wish to modify does not
			have a _name_ this will not work). You can modify any properties of the component
			except for _methods_. Setting this at runtime will have no affect.
		*/
		componentOverrides: null
	},
	//* @protected
	protectedStatics: {
		// for memoizing kind-prefix names in nameComponent
		_kindPrefixi: {},
		// for naming the unnamed
		_unnamedKindNumber: 0
	},
	defaultKind: "Component",
	noDefer: true,
	handlers: {},
	mixins: [
		enyo.ApplicationSupport,
		enyo.ComponentBindingSupport
	],
	toString: function() {
		return this.id + " [" + this.kindName + "]";
	},
	constructor: enyo.inherit(function (sup) {
		return function(props) {
			// initialize instance objects
			this._componentNameMap = {};
			this.$ = {};
			sup.apply(this, arguments);
		};
	}),
	//*@protected
	constructed: enyo.inherit(function (sup) {
		return function(props) {
			// perform initialization
			this.create(props);
			sup.apply(this, arguments);
		};
	}),
	create: function() {
		// stop and queue all of the notifications happening synchronously to allow
		// responders to only do single passes on work traversing the tree
		this.stopNotifications();
		this.ownerChanged();
		this.initComponents();
		// release the kraken!
		this.startNotifications();
	},
	initComponents: function() {
		// The _components_ property in kind declarations is renamed to
		// _kindComponents_ by the Component subclass mechanism.  This makes it
		// easy for the developer to distinguish kindComponents from the components
		// in _this.components_, without having to worry about the actual difference.
		//
		// Specifically, the difference is that kindComponents are constructed as
		// owned by this control (whereas components in _this.components_ are not).
		// In addition, kindComponents are marked with the _isChrome: true_ flag.
		this.createChrome(this.kindComponents);
		this.createClientComponents(this.components);
	},
	createChrome: function(inComponents) {
		this.createComponents(inComponents, {isChrome: true});
	},
	createClientComponents: function(inComponents) {
		this.createComponents(inComponents, {owner: this.getInstanceOwner()});
	},
	getInstanceOwner: function() {
		return (!this.owner || this.owner.notInstanceOwner) ? this : this.owner;
	},
	//* @public
	/**
		Removes this component from its owner (sets _owner_ to null) and does
		any necessary cleanup. The component is flagged with a _destroyed: true_
		property. Usually, the component will be suitable for garbage collection
		after being destroyed, unless user code keeps a reference to it.
	*/
	destroy: enyo.inherit(function (sup) {
		return function() {
			this.destroyComponents();
			this.setOwner(null);
			sup.apply(this, arguments);
			this.stopAllJobs();
		};
	}),
	/**
		Destroys all owned components.
	*/
	destroyComponents: function() {
		enyo.forEach(this.getComponents(), function(c) {
			// This local components list may be stale as components
			// we owned when the loop started could have been destroyed
			// by containers. Avoid redestroying components by testing
			// destroyed flag.
			if (!c.destroyed && !(c instanceof enyo.Controller && c.global)) {
				c.destroy();
			}
		});
	},
	//* @protected
	makeId: function() {
		var delim = "_", pre = this.owner && this.owner.getId();
		var baseName = this.name || ("@@" + (++enyo.Component._unnamedKindNumber));
		return (pre ? pre + delim : "") + baseName;
	},
	ownerChanged: function(inOldOwner) {
		if (inOldOwner && inOldOwner.removeComponent) {
			inOldOwner.removeComponent(this);
		}
		if (this.owner && this.owner.addComponent) {
			this.owner.addComponent(this);
		}
		if (!this.id) {
			this.id = this.makeId();
		}
		//this.id = this.makeId();
	},
	nameComponent: function(inComponent) {
		var prefix = enyo.Component.prefixFromKindName(inComponent.kindName);
		// get last memoized name index
		var n, i = this._componentNameMap[prefix] || 0;
		// find an available name
		do {
			n = prefix + (++i > 1 ? String(i) : "");
		} while (this.$[n]);
		// memoize next likely-unique id tag for this prefix
		this._componentNameMap[prefix] = Number(i);
		// set and return
		inComponent.name = n;
		return inComponent.name;
	},
	/**
		Adds _inComponent_ to the list of components owned by the current
		component (i.e., _this.$_).
	*/
	addComponent: function(inComponent) {
		var n = inComponent.getName();
		if (!n) {
			n = this.nameComponent(inComponent);
		}
		if (this.$[n]) {
			this.warn('Duplicate component name "' + n + '" in owner "' + this.id + '" violates ' +
				'unique-name-under-owner rule, replacing existing component in the hash and continuing, ' +
				'but this is an error condition and should be fixed.');
		}
		this.$[n] = inComponent;
		this.notifyObservers("$." + n, null, inComponent);
	},
	//* Removes _inComponent_ from the list of components owned by the current
	//* component (i.e., _this.$_).
	removeComponent: function(inComponent) {
		delete this.$[inComponent.getName()];
	},
	//* @public
	/**
		Returns an array of owned components; in other words, converts the _$_
		hash into an array and returns the array.
	*/
	getComponents: function() {
		var results = [];
		for (var n in this.$) {
			results.push(this.$[n]);
		}
		return results;
	},
	//* @protected
	adjustComponentProps: function(inProps) {
		if (this.defaultProps) {
			enyo.mixin(inProps, this.defaultProps, {ignore: true});
		}
		inProps.kind = inProps.kind || inProps.isa || this.defaultKind;
		inProps.owner = inProps.owner || this;
	},
	_createComponent: function(inInfo, inMoreInfo) {
		if (!inInfo.kind && ("kind" in inInfo)) {
			throw "enyo.create: Attempt to create a null kind. Check dependencies for [" + inInfo.name + "].";
		}
		// CAVEAT: inInfo and inMoreInfo are copied before mutation, but it's only a shallow copy
		var props = enyo.mixin(enyo.clone(inMoreInfo), inInfo);
		this.adjustComponentProps(props);
		return enyo.Component.create(props);
	},
	//* @public
	/**
		Creates and returns a component as defined by the combination of
		_inInfo_ and _inMoreInfo_. Properties in _inInfo_ override properties in
		_inMoreInfo_.

		The created component passes through initialization machinery provided
		by the creating component, which may supply special handling.
		Unless the owner is explicitly specified, the new component will be
		owned by the instance on which _createComponent_ is called.

			// Create a new component named _dynamic_ owned by _this_
			// (will be available as this.$.dynamic).
			this.createComponent({name: "dynamic"});

			// Create a new component named _another_ owned by _other_
			// (will be available as other.$.another).
			this.createComponent({name: "another"}, {owner: other});
	*/
	createComponent: function(inInfo, inMoreInfo) {
		// createComponent and createComponents both delegate to the protected method (_createComponent),
		// allowing overrides to customize createComponent and createComponents separately.
		return this._createComponent(inInfo, inMoreInfo);
	},
	/**
		Creates Component objects as defined by the array of configurations
		_inInfos_. Each configuration in _inInfos_ is combined with _inCommonInfo_,
		as described in _createComponent_.

		Returns an array of references to the created components.

			// ask foo to create components _bar_ and _zot_, but set the owner of
			// both components to _this_.
			this.$.foo.createComponents([
				{name: "bar"},
				{name: "zot"}
			], {owner: this});
	*/
	createComponents: function(inInfos, inCommonInfo) {
		if (inInfos) {
			var cs = [];
			for (var i=0, ci; (ci=inInfos[i]); i++) {
				cs.push(this._createComponent(ci, inCommonInfo));
			}
			return cs;
		}
	},
	//* @protected
	getBubbleTarget: function() {
		return this.bubbleTarget || this.owner;
	},
	//* @public
	/**
		Bubbles an event up an object chain, starting with _this_.

		If a handler for this event returns true (aka _handled_),
		bubbling is stopped.

		Handlers always have this signature:

			function(inSender, inEvent)

		where _inSender_ refers to the component that most recently
		propagated the event and _inEvent_ is an object containing
		event information.

		_inEvent_ will have at least one property, _originator_, which
		references the component that triggered the event in the first place.
	*/
	bubble: function(inEventName, inEvent, inSender) {
		if (this._silenced) {
			return;
		}
		var e = inEvent || {};
		if (!enyo.exists(e.originator)) {
			e.originator = inSender || this;
		}
		return this.dispatchBubble(inEventName, e, inSender || this);
	},
	/**
		Bubbles an event up an object chain, starting <b>above</b> _this_.

		If a handler for this event returns true (i.e., _handled_),
		bubbling is stopped.

		Handlers always have this signature:

			function(inSender, inEvent)

		where _inSender_ refers to the component that most recently
		propagated the event and _inEvent_ is an object containing
		event information.

		_inEvent_ will have at least one property, _originator_, which
		references the component that triggered the event in the first place.
	*/
	bubbleUp: function(inEventName, inEvent) {
		if (this._silenced) {
			return;
		}
		// Bubble to next target
		var e = inEvent || {};
		var next = this.getBubbleTarget();
		if (next) {
			// use delegate as sender if it exists to preserve illusion
			// that event is dispatched directly from that, but we still
			// have to bubble to get decorations
			return next.dispatchBubble(inEventName, e, e.delegate || this);
		}
		return false;
	},
	//* @protected
	/**
		Sends an event to a named delegate. This object may dispatch an event
		to itself via a handler, or to its owner via an event property, e.g.:

			handlers {
				// 'tap' events dispatched to this.tapHandler
				ontap: "tapHandler"
			}

			// 'tap' events dispatched to 'tapHandler' delegate in this.owner
			ontap: "tapHandler"
	*/
	dispatchEvent: function(name, event, sender) {
		if (this._silenced) {
			return;
		}
		// if the event has a delegate associated with it we grab that
		// for reference
		// NOTE: This is unfortunate but we can't use a pooled object here because
		// we don't know where to release it
		var delegate = (event || (event = {})).delegate;
		var ret;
		// bottleneck event decoration w/ optimization to avoid call to empty function
		if (this.decorateEvent !== enyo.Component.prototype.decorateEvent) {
			this.decorateEvent(name, event, sender);
		}

		// first, handle any delegated events intended for this object
		if (delegate && delegate.owner === this) {
			// the most likely case is that we have a method to handle this
			if (this[name] && "function" === typeof this[name]) {
				return this.dispatch(name, event, sender);
			}
			// but if we don't, just stop the event from going further
			return;
		}

		// for non-delgated events, try the handlers block if possible
		if (!delegate) {
			if (this.handlers && this.handlers[name] &&
				this.dispatch(this.handlers[name], event, sender)) {
				return true;
			}
			// then check for a delegate property for this event
			if (this[name] && enyo.isString(this[name])) {
				// we dispatch it up as a special delegate event with the
				// component that had the delegation string property stored in
				// the "delegate" property
				event.delegate = this;
				ret = this.bubbleUp(this[name], event, sender);
				delete event.delegate;
				return ret;
			}
		}
	},
	// internal - try dispatching event to self, if that fails bubble it up the tree
	dispatchBubble: function(inEventName, inEvent, inSender) {
		if (this._silenced) {
			return;
		}
		// Try to dispatch from here, stop bubbling on truthy return value
		if (this.dispatchEvent(inEventName, inEvent, inSender)) {
			return true;
		}
		// Bubble to next target
		return this.bubbleUp(inEventName, inEvent, inSender);
	},
	decorateEvent: function(inEventName, inEvent, inSender) {
		// an event may float by us as part of a dispatchEvent chain
		// both call this method so intermediaries can decorate inEvent
	},
	stopAllJobs: function() {
		if (this.__jobs) {
			for (var jobName in this.__jobs) {
				this.stopJob(jobName);
			}
		}
	},
	//* @public
	/**
		Dispatches the event to named delegate _inMethodName_, if it exists.
		Subkinds may re-route dispatches.
		Note that both 'handlers' events and events delegated from owned controls
		arrive here. If you need to handle these differently, you may also need
		to override _dispatchEvent_.
	*/
	dispatch: function(inMethodName, inEvent, inSender) {
		if (this._silenced) {
			return;
		}
		var fn = inMethodName && this[inMethodName];
		if (fn && "function" === typeof fn) {
			// TODO: we use inSender || this but the inSender argument
			// to keep unit tests working will be deprecated in the future
			return fn.call(this, inSender || this, inEvent);
		}
	},
	/**
		Sends a message to myself and all of my components.
		You can stop a waterfall into components owned by a
		receiving object by returning a truthy value from
		the event handler.
	*/
	waterfall: function(name, event, sender) {
		if (this._silenced) {
			return;
		}
		event = event || {};
		//this.log(name, (sender || this).name, "=>", this.name);
		if (this.dispatchEvent(name, event, sender)) {
			return true;
		}
		this.waterfallDown(name, event, sender || this);
	},
	/**
		Sends a message to all of my components, but not myself.
		You can stop a waterfall into components owned by a
		receiving object by returning a truthy value from
		the event handler.
	*/
	waterfallDown: function(name, event, sender) {
		if (this._silenced) {
			return;
		}
		for (var n in this.$) {
			this.$[n].waterfall(name, event, sender);
		}
	},
	//*@protected
	_silenced: false,
	//*@protected
	_silenceCount: 0,
	//*@public
	/**
		Sets a flag that disables event propagation for this component. Also
		increments an internal counter that tracks the number of times the
		_unsilence_ method must be called before event propagation will continue.
	*/
	silence: function () {
		this._silenced = true;
		this._silenceCount += 1;
	},
	/**
		Returns `true` if the object is currently _silenced_ and will not propagate
		events (of any kind) otherwise `false`.
	*/
	isSilenced: function () {
		return this._silenced;
	},
	/**
		Allows event propagation for this component if the internal silence counter
		is 0; otherwise, decrements the counter by one.  For event propagation to
		resume, this method must be called one time for each call to _silence_.
	*/
	unsilence: function () {
		if (0 !== this._silenceCount) {
			--this._silenceCount;
		}
		if (0 === this._silenceCount) {
			this._silenced = false;
		}
	},
	/**
		Creates a new job tied to this instance of the component. If the component
		is destroyed, any jobs associated with it will be stopped.

		If you start a job with the same name as a pending job, the original job
		will be stopped; this can be useful for resetting timeouts.

		You may supply a priority level (1-10) at which the job should be executed.
		The default level is 5. Setting the priority lower than 5 (or setting it to
		the string "low") will defer the job if an animation is in progress, which
		can help to avoid stuttering.
	*/
	startJob: function(inJobName, inJob, inWait, inPriority) {
		inPriority = inPriority || 5;
		var jobs = (this.__jobs = this.__jobs || {});
		// allow strings as job names, they map to local method names
		if (enyo.isString(inJob)) {
			inJob = this[inJob];
		}
		// stop any existing jobs with same name
		this.stopJob(inJobName);
		jobs[inJobName] = setTimeout(this.bindSafely(function() {
			enyo.jobs.add(this.bindSafely(inJob), inPriority, inJobName);
		}), inWait);
	},
	/**
		Stops a component-specific job before it has been activated.
	*/
	stopJob: function(inJobName) {
		var jobs = (this.__jobs = this.__jobs || {});
		if (jobs[inJobName]) {
			clearTimeout(jobs[inJobName]);
			delete jobs[inJobName];
		}
		enyo.jobs.remove(inJobName);
	},
	/**
		Execute the method _inJob_ immediately, then prevent
		any other calls to throttleJob with the same _inJobName_ from running
		for the next _inWait_ milliseconds.
	*/
	throttleJob: function(inJobName, inJob, inWait) {
		var jobs = (this.__jobs = this.__jobs || {});
		// if we still have a job with this name pending, return immediately
		if (jobs[inJobName]) {
			return;
		}
		// allow strings as job names, they map to local method names
		if (enyo.isString(inJob)) {
			inJob = this[inJob];
		}
		inJob.call(this);
		jobs[inJobName] = setTimeout(this.bindSafely(function() {
			this.stopJob(inJobName);
		}), inWait);
	}
});

//* @protected

enyo.defaultCtor = enyo.Component;

// Creates new instances from config objects. This method looks up the
// proper constructor based on the provided _kind_ attribute.
enyo.create = enyo.Component.create = function(inConfig) {
	if (!inConfig.kind && ("kind" in inConfig)) {
		throw "enyo.create: Attempt to create a null kind. Check dependencies for [" + (inConfig.name || "") + "].";
	}
	var kind = inConfig.kind || inConfig.isa || enyo.defaultCtor;
	var Ctor = enyo.constructorForKind(kind);
	if (!Ctor) {
		enyo.error('no constructor found for kind "' + kind + '"');
		Ctor = enyo.Component;
	}
	return new Ctor(inConfig);
};

enyo.Component.subclass = function(ctor, props) {
	// Note: To reduce API surface area, sub-components are declared only as
	// 'components' in both kind and instance declarations.
	//
	// However, 'components' from kind declarations must be handled separately
	// at creation time.
	//
	// We rename the property here to avoid having
	// to interrogate the prototype at creation time.
	//
	var proto = ctor.prototype;
	//
	if (props.components) {
		proto.kindComponents = props.components;
		delete proto.components;
	} else {
		// Feature to mixin overrides of super-kind component properties from named hash
		// (only applied when the sub-kind doesn't supply its own components block)
		if (props.componentOverrides) {
			proto.kindComponents = enyo.Component.overrideComponents(proto.kindComponents, props.componentOverrides, proto.defaultKind);
		}
	}
};

enyo.Component.concat = function (ctor, props) {
	var p = ctor.prototype || ctor;
	if (props.handlers) {
		var h = p.handlers? enyo.clone(p.handlers): {};
		p.handlers = enyo.mixin(h, props.handlers);
		delete props.handlers;
	}
	if (props.events) {
		enyo.Component.publishEvents(p, props);
	}
};

enyo.Component.overrideComponents = function(components, overrides, defaultKind) {
	var fn = function (k, v) { return !(enyo.isFunction(v) || enyo.isInherited(v)); };
	components = enyo.clone(components);
	for (var i=0; i<components.length; i++) {
		var c = enyo.clone(components[i]);
		var o = overrides[c.name];
		var ctor = enyo.constructorForKind(c.kind || defaultKind);
		if (o) {
			// will handle mixins, observers, computed properties and bindings because they
			// overload the default but this will not handle the kind concatenations...
			enyo.concatHandler(c, o);
			var b = (c.kind && ((typeof c.kind == "string" && enyo.getPath(c.kind)) || (typeof c.kind == "function" && c.kind))) || enyo.defaultCtor;
			while (b) {
				if (b.concat) { b.concat(c, o, true); }
				b = b.prototype.base;
			}
			// All others just mix in
			enyo.mixin(c, o, {filter: fn});
		}
		if (c.components) {
			c.components = enyo.Component.overrideComponents(c.components, overrides, ctor.prototype.defaultKind);
		}
		components[i] = c;
	}
	return components;
};

enyo.Component.publishEvents = function(ctor, props) {
	var es = props.events;
	if (es) {
		var cp = ctor.prototype || ctor;
		for (var n in es) {
			enyo.Component.addEvent(n, es[n], cp);
		}
	}
};

enyo.Component.addEvent = function(inName, inValue, inProto) {
	var v, fn;
	if (!enyo.isString(inValue)) {
		v = inValue.value;
		fn = inValue.caller;
	} else {
		if (inName.slice(0, 2) != 'on') {
			enyo.warn("enyo.Component.addEvent: event names must start with 'on'. " + inProto.kindName +
				" event '" + inName + "' was auto-corrected to 'on" + inName + "'.");
			inName = "on" + inName;
		}
		v = inValue;
		fn = "do" + enyo.cap(inName.slice(2));
	}
	inProto[inName] = v;
	if (!inProto[fn]) {
		inProto[fn] = function(payload) {
			// bubble this event
			var e = payload;
			if (!e) {
				e = {};
			}
			var d = e.delegate;
			// delete payload.delegate;
			e.delegate = undefined;
			if (!enyo.exists(e.type)) {
				e.type = inName;
			}
			this.bubble(inName, e);
			if (d) {
				e.delegate = d;
			}
		};
		// NOTE: Mark this function as a generated event handler to allow us to
		// do event chaining. Is this too complicated?
		//inProto[fn]._dispatcher = true;
	}
};

enyo.Component.prefixFromKindName = function(inKindName) {
	var prefix = enyo.Component._kindPrefixi[inKindName];
	if (!prefix) {
		// memoize naming information for this kind
		var l = inKindName.lastIndexOf(".");
		prefix = (l >= 0) ? inKindName.slice(l+1) : inKindName;
		// lower-case the leading char
		prefix = prefix.charAt(0).toLowerCase() + prefix.slice(1);
		// memoize result
		enyo.Component._kindPrefixi[inKindName] = prefix;
	}
	return prefix;
};
