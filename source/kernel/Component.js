/**
	_enyo.Component_ is the fundamental building block for Enyo applications.
	Components are designed to fit together, so that complex behaviors may be
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
	[Components](https://github.com/enyojs/enyo/wiki/Creating-Components)
	in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Component",
	kind: enyo.Object,
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
		owner: null
	},
	//* @protected
	statics: {
		// for memoizing kind-prefix names in nameComponent
		_kindPrefixi: {},
		// for naming the unnamed
		_unnamedKindNumber: 0
	},
	defaultKind: "Component",
	handlers: {},
	mixins: ["enyo.ApplicationSupport"],
	__jobs: {},
	toString: function() {
		return this.kindName;
	},
	constructor: function(props) {
		// initialize instance objects
		this._componentNameMap = {};
		this.$ = {};
		this.inherited(arguments);
	},
	constructed: function(inProps) {
		this.handlers = enyo.mixin(enyo.clone(this.kindHandlers), this.handlers);
		// perform initialization
		this.create(inProps);
	},
	create: function() {
		this.ownerChanged();
		this.initComponents();
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
		any cleanup. The component is flagged with a _destroyed: true_ property.
		Usually the component will be suitable for garbage collection after
		being destroyed, unless user code keeps a reference to it.
	*/
	destroy: function() {
		this.destroyComponents();
		this.setOwner(null);
		this.inherited(arguments);
		this.stopAllJobs();
	},
	/**
		Destroys all owned components.
	*/
	destroyComponents: function() {
		enyo.forEach(this.getComponents(), function(c) {
			// This local components list may be stale as components
			// we owned when the loop started could have been destroyed
			// by containers. Avoid redestroying components by testing
			// destroyed flag.
			if (!c.destroyed) {
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
			enyo.mixin(inProps, this.defaultProps);
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
		Creates Components as defined by the array of configurations _inInfos_.
		Each configuration in _inInfos_ is combined with _inCommonInfo_ as
		described in _createComponent_.

		_createComponents_ returns an array of references to the created components.

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
		return this._bubble_target || this.owner;
	},
	//* @public
	/**
		Bubbles an event up an object chain, starting with _this_.

		If a handler for this event returns true (aka _handled_),
		bubbling is stopped.

		Handlers always have this signature:

			function(inSender, inEvent)

		where _inSender_ refers to the Component that most recently
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
		// FIXME: is this the right place?
		if (!("originator" in e)) {
			e.originator = inSender || this;
			// FIXME: use indirection here?
			//e.delegate = e.originator.delegate || e.originator.owner;
		}
		return this.dispatchBubble(inEventName, e, inSender || this);
	},
	/**
		Bubbles an event up an object chain, starting <b>above</b> _this_.

		If a handler for this event returns true (aka _handled_),
		bubbling is stopped.

		Handlers always have this signature:

			function(inSender, inEvent)

		where _inSender_ refers to the Component that most recently
		propagated the event and _inEvent_ is an object containing
		event information.

		_inEvent_ will have at least one property, _originator_, which
		references the component that triggered the event in the first place.
	*/
	bubbleUp: function(inEventName, inEvent, inSender) {
		if (this._silenced) {
			return;
		}
		// Bubble to next target
		var next = this.getBubbleTarget();
		var delegate = inEvent.delegate;
		if (next) {
			return next.dispatchBubble(inEventName, inEvent, delegate || this);
		}
		return false;
	},
	//* @protected
	/**
		Dispatching refers to sending an event to a named delegate.
		This object may dispatch an event to itself via a handler,
		or to its owner via an event property, e.g.:

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
		var delegate = (event || (event = {})).delegate;
		var ret;
		// bottleneck event decoration
		this.decorateEvent(name, event, sender);
		// dispatch via the handlers block if possible
		if (this.handlers && this.handlers[name] &&
			this.dispatch(this.handlers[name], event, sender)) {
			return true;
		}

		if (this[name]) {
			if ("function" === typeof this[name]) {
				if (this._is_controller || (delegate && this === delegate.owner)) {
					return this.dispatch(name, event, sender);
				}
			} else {
				// otherwise we dispatch it up because it is a remap of another event
				if (!delegate) {
					event.delegate = this;
				}
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
		// an event may float by us as part of a dispatchEvent chain or delegateEvent
		// both call this method so intermediaries can decorate inEvent
	},
	bubbleDelegation: function(inDelegate, inName, inEventName, inEvent, inSender) {
		if (this._silenced) {
			return;
		}
		// next target in bubble sequence
		var next = this.getBubbleTarget();
		if (next) {
			return next.delegateEvent(inDelegate, inName, inEventName, inEvent, inSender);
		}
	},
	delegateEvent: function(inDelegate, inName, inEventName, inEvent, inSender) {
		if (this._silenced) {
			return;
		}
		// override this method to play tricks with delegation
		// bottleneck event decoration
		this.decorateEvent(inEventName, inEvent, inSender);
		// by default, dispatch this event if we are in fact the delegate
		if (inDelegate == this) {
			return this.dispatch(inName, inEvent, inSender);
		}
		return this.bubbleDelegation(inDelegate, inName, inEventName, inEvent, inSender);
	},
	stopAllJobs: function() {
		for (var jobName in this.__jobs) {
			this.stopJob(jobName);
		}
	},
	//* @public
	/**
		Dispatches the event to named delegate _inMethodName_, if it exists.
		Subkinds may re-route dispatches.
		Note that both 'handlers' events and events delegated from owned controls
		arrive here. If you need to handle these differently, you may
		need to also override _dispatchEvent_.
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
	_silence_count: 0,
	//*@public
	/**
		Sets a flag that will disable event propagation for this
		component. Increments the internal counter ensuring that the
		_unsilence_ method must be called that many times before
		event propagation will continue.
	*/
	silence: function () {
		this._silenced = true;
		this._silence_count += 1;
	},

	//*@public
	/**
		If the internal silence counter is 0 this method will allow
		event propagation for this component. It will decrement the counter
		by one otherwise. This method must be called one-time for each
		_silence_ call.
	*/
	unsilence: function () {
		if (0 !== this._silence_count) {
			--this._silence_count;
		}
		if (0 === this._silence_count) {
			this._silenced = false;
		}
	},
	/**
		Create a new job tied to this instance of the component. If the component is
		destroyed, any jobs associated it will also be stopped. If you start a job
		that is pending with the same name, the original job will be stopped, making this
		useful for timeouts that need to be reset.
	*/
	startJob: function(inJobName, inJob, inWait) {
		// allow strings as job names, they map to local method names
		if (enyo.isString(inJob)) {
			inJob = this[inJob];
		}
		// stop any existing jobs with same name
		this.stopJob(inJobName);
		this.__jobs[inJobName] = setTimeout(this.bindSafely(function() {
			this.stopJob(inJobName);
			// call "inJob" with this bound to the component.
			inJob.call(this);
		}), inWait);
	},
	/**
		Stop a component-specific job before it has been activated.
	*/
	stopJob: function(inJobName) {
		if (this.__jobs[inJobName]) {
			clearTimeout(this.__jobs[inJobName]);
			delete this.__jobs[inJobName];
		}
	}
});

//* @protected

enyo.defaultCtor = enyo.Component;

// a method to create new instances from config objects.  It handles looking up the proper
// constructor based on the provided kind attribute.
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
	// Note: to reduce API surface area, sub-components are declared only as
	// 'components' in both kind and instance declarations.
	//
	// However, 'components' from kind declarations must be handled separately
	// at create-time.
	//
	// We rename the property here to avoid having
	// to interrogate the prototype at create-time.
	//
	var proto = ctor.prototype;
	//
	if (props.components) {
		proto.kindComponents = props.components;
		delete proto.components;
	}
	//
	// handlers are merged with supertype handlers
	// and kind time.
	//
	if (props.handlers) {
		var kh = proto.kindHandlers;
		proto.kindHandlers = enyo.mixin(enyo.clone(kh), proto.handlers);
		proto.handlers = null;
	}
	// events property defines published events for Component kinds
	if (props.events) {
		this.publishEvents(ctor, props);
	}
};

enyo.Component.publishEvents = function(ctor, props) {
	var es = props.events;
	if (es) {
		var cp = ctor.prototype;
		for (var n in es) {
			this.addEvent(n, es[n], cp);
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
			//return this.bubble(inName, enyo.except(["delegate"], inEvent || {}));
			payload = payload || {};
			var delegate = payload.delegate;
			delete payload.delegate;
			this.bubble(inName, payload);
			if (delegate) {
				payload.delegate = delegate;
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
