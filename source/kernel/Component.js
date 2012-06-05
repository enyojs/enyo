/**
	_enyo.Component_ is the fundamental building block for Enyo applications.
	Components are designed to fit together, so that complex behaviors may be
	fashioned from smaller bits of functionality.

	## Configurations

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
	
	## Ownership

	The concept of ownership allows us to organize components into trees, e.g.:

	* Component A
		* Component B (owner: A)
		* Component C (owner: A)
			* Component E (owner: C)
		* Component D (owner A)

	Note that, when designing code, a component should only be concerned with
	the components it owns (one level down). The coder never needs to worry
	about the complex tree structure that exists at runtime. For example,
	Component A will never reference Component E directly; it will only access
	the interface supplied by Component C.

	The ownership of a component is controlled by the _owner_ property. To 
	change ownership of a component, use the _setOwner_ method.

	Every component has a name, and its name must be unique among all the
	components of its owner. In other words, a component can't own two
	components with the same name. A component may access its owned components
	by name using the _$_ hash.

	For example, if a component owns components named 'componentB' and
	'componentC', it can refer to them with code like this:

		someMethod: function() {
			this.$.componentB.doWork();
			this.$.componentC.doWork();
		}

	Sometimes we refer to the set of objects in a component's _$_ hash as the
	component's _scope_.

	Note that all components visible in the _components_ property will be owned
	by the top-level component. For example:

		// create a new component, which owns several components
		var c = new enyo.Component({
			name: "me",
			components: [
				{name: "other", components: [
					{name: "third"},
					{name: "fourth"}
				]}
			]
		});

	Although the components _third_ and _fourth_ are nested inside the
	configuration for _other_, they are still owned by _me_. This concept is
	important; it means that whatever components you can see listed are in the
	top-level component's scope.

	The _me_ component might have a complex configuration, but we can see at a
	glance that it has access to _other_, _third_, and _fourth_ to get its work
	done. Those objects will be available in the _$_ hash.

	## Events

	A component can send a message to its owner using the _event_ mechanism. A
	component exposes events as string properties whose	names begin with "on".
	To listen to messages, a component may assign the name of one of its methods
	to the event property of an owned component.
	
	For example, the _WebService_ component has an _onSuccess_ property. The
	owner of a WebService can set _onSuccess_ to the name of a method to be
	called when the WebService operation completes successfully.

		// create a new component, which has a component of its own, and listens
		// for an event
		var c = new enyo.Component({
			name: "MyComponent",
			components: [
				{kind: "WebService", onSuccess: "webSuccess"}
			],
			webSuccess: function(inSender) {
				this.log(inSender.name, "was successful");
			}
		});

	We call _webSuccess_ the _delegate_ for the _success_ event of the
	WebService. Because the event properties take method names as values, we
	call the event property values _named delegates_.

	Note that the _webSuccess_ method takes an argument called _inSender_, which
	refers to the object that generated the event. Different events may supply
	additional arguments, but they all supply _inSender_ as the first argument.

	Component events are much like DOM events. In fact, Enyo makes many DOM
	events available as component events. Remember that Ccmponents do not, in
	general, represent DOM nodes, but _Controls_ do; see the
	<a href="#enyo.Control">Control</a> documentation for more information.

	## Create and Destroy

	When a component is instantiated, and after all constructors are executed,
	the _create_ method is invoked. During _Component.create_, all owned
	components are created.

	Subclasses of Component often override _create_ to do initialization tasks.
	If you override Component, make sure to call the inherited _create_ method,
	and remember that owned components (and the _$_ hash) are only ready after
	_this.inherited()_ has returned.

		enyo.kind({
			name: "MyComponent",
			kind: enyo.Component,
			create: function() {
				// I can do tasks before my components are created
				this.inherited(arguments);
				// ... or I can do tasks after, my $ hash is ready now
			}
		});

	To delete a component, use the _destroy_ method. Calling _destroy_ on a
	component will remove it from all framework	bookkeeping, and in particular
	will set its owner to _null_. Generally, this will be enough to allow the
	object to be garbage-collected, unless you have maintained a reference to it
	yourself.

		allDone: function() {
			// remove workComponent, and do any cleanup
			this.$.workComponent.destroy();
			// now this.$.workComponent is undefined
		}

	You may override the _destroy_ method to include custom cleanup code.
	Again, you must make sure to call the inherited method before returning.

	## Creating Components Dynamically

	The _createComponent_ and _createComponents_ methods are included to create
	components dynamically.	 Refer to the inline documentation for those methods
	for more information.
*/
enyo.kind({
	name: "enyo.Component",
	kind: enyo.Object,
	published: {
		name: "",
		id: "",
		owner: null
	},
	//* @protected
	statics: {
		// for memoizing kind-prefix names in nameComponent
		_kindPrefixi: {}
	},
	defaultKind: "Component",
	handlers: {},
	toString: function() {
		return this.kindName;
	},
	constructor: function() {
		// initialize instance objects
		this._componentNameMap = {};
		this.$ = {};
		this.inherited(arguments);
	},
	constructed: function(inProps) {
		// entire constructor chain has fired, now start creation chain
		// process instance properties
		this.importProps(inProps);
		// perform initialization
		this.create();
	},
	//* @protected
	importProps: function(inProps) {
		if (inProps) {
			for (var n in inProps) {
				this[n] = inProps[n];
			}
		}
		this.handlers = enyo.mixin(enyo.clone(this.kindHandlers), this.handlers);
	},
	create: function() {
		this.ownerChanged();
		this.initComponents();
	},
	initComponents: function() {
		// 'components' property in kind declarations is renamed to 'kindComponents'
		// by the Component subclass mechanism, allowing us to distinguish them easily
		// from this.components, without the code-writer having to worry about the
		// difference.
		// Specifically, the difference is that kindComponents are constructed
		// as owned by this control (and this.components are not).
		// Also, kindComponents are marked with isChrome true flag.
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
		Removes this Component from its owner (sets owner to null) and does any
		cleanup. The Component is flagged with a _destroyed: true_ property.
		Usually the Component will be suitable for garbage collection after 
		being destroyed, unless user code keeps a reference to it.
	*/
	destroy: function() {
		this.destroyComponents();
		this.setOwner(null);
		// JS objects are never truly destroyed (GC'd) until all references are gone,
		// we might have some delayed action on this object that needs to have access
		// to this flag.
		this.destroyed = true;
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
	makeId: function() {
		var delim = "_", pre = this.owner && this.owner.getId();
		return this.name ? (pre ? pre + delim : "") + this.name : "";
	},
	ownerChanged: function(inOldOwner) {
		if (inOldOwner) {
			inOldOwner.removeComponent(this);
		}
		if (this.owner) {
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
		return inComponent.name = n;
	},
	addComponent: function(inComponent) {
		var n = inComponent.getName();
		if (!n) {
			n = this.nameComponent(inComponent);
		}
		if (this.$[n]) {
			this.warn('Duplicate component name "' + n + '" in owner "' + this.id + '" violates unique-name-under-owner rule, replacing existing component in the hash and continuing, but this is an error condition and should be fixed.');
			//if (this.shouldWarn()) {
			/*
			try { 
				throw new Error('Duplicate component name "' + n + '" violates unique-name-under-owner rule, replacing existing component in the hash and continuing, but this is an error condition and should be fixed.');
			} catch(x) {
				console.warn(x);
				console.log(x.stack);
			}
			*/
			/*this.warn() &&*/ //console.warn('Duplicate component name "' + n + '" violates unique-name-under-owner rule, replacing existing component in the hash and continuing, but this is an error condition and should be fixed.');
			//}
		}
		this.$[n] = inComponent;
	},
	removeComponent: function(inComponent) {
		delete this.$[inComponent.getName()];
	},
	//* @public
	/**
		Returns an Array of owned components. In other words, converts the _$_
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
		// CAVEAT: inInfo and inMoreInfo are copied before mutation, but it's only a shallow copy
		var props = enyo.mixin(enyo.clone(inMoreInfo), inInfo);
		this.adjustComponentProps(props);
		return enyo.Component.create(props);
	},
	//* @public
	/**
		Creates and returns a Component as defined by the combination of
		_inInfo_ and _inMoreInfo_.
		The created Component passes through initialization machinery provided
		by the creating component, which may supply special handling.
		Unless the owner is explicitly specified, the new component will
		be owned by _this_.
		Properties in _inInfo_ override properties in _inMoreInfo_.

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
		Creates Components as defined by the array of configurations _inInfo_. 
		Each configuration in _inInfo_ is combined with _inCommonInfo_ as 
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
		return this.owner;
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
		var e = inEvent || {};
		// FIXME: is this the right place?
		if (!("originator" in e)) {
			e.originator = inSender || this;
			// FIXME: use indirection here?
			//e.delegate = e.originator.delegate || e.originator.owner;
		}
		return this.dispatchBubble(inEventName, e, inSender);
	},
	dispatchBubble: function(inEventName, inEvent, inSender) {
		// Try to dispatch from here, stop bubbling on truthy return value
		if (this.dispatchEvent(inEventName, inEvent, inSender)) {
			return true;
		}
		// Bubble to next target
		return this.bubbleUp(inEventName, inEvent, inSender);
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
		// Bubble to next target
		var next = this.getBubbleTarget();
		if (next) {
			return next.dispatchBubble(inEventName, inEvent, this);
		}
		return false;
	},
	//* @protected
	/**
		Dispatch refers to sending an event to a named delegate.
		This object may dispatch an event to itself via a handler, 
		or to it's owner ia an event property.
		e.g.
			handlers {
				// 'tap' events dispatched to this.tapHandler
				ontap: "tapHandler"
			}
			// 'tap' dispatched to 'tapHandler' delegate in this.owner
			ontap: "tapHandler",
	*/
	dispatchEvent: function(inEventName, inEvent, inSender) {
		// bottleneck event decoration
		this.decorateEvent(inEventName, inEvent, inSender);
		//
		// Note: null checks and sub-expressions are unrolled in this
		// high frequency method to reduce call stack in the 90% case.
		// These expressions should fail early.
		//
		// try to dispatch this event directly via handlers
		//
		if (this.handlers[inEventName] && this.dispatch(this.handlers[inEventName], inEvent, inSender)) {
			return true;
		}
		//
		// try to delegate this event to our owner via event properties
		//
		if (this[inEventName]) {
			return this.bubbleDelegation(this.owner, this[inEventName], inEventName, inEvent, this);
		}
	},
	decorateEvent: function(inEventName, inEvent, inSender) {
		// an event may float by us as part of a dispatchEvent chain or delegateEvent
		// both call this method so intermediaries can decorate inEvent
	},
	bubbleDelegation: function(inDelegate, inName, inEventName, inEvent, inSender) {
		// next target in bubble sequence
		var next = this.getBubbleTarget();
		if (next) {
			return next.delegateEvent(inDelegate, inName, inEventName, inEvent, inSender);
		}
	},
	delegateEvent: function(inDelegate, inName, inEventName, inEvent, inSender) {
		// override this method to play tricks with delegation
		// bottleneck event decoration
		this.decorateEvent(inEventName, inEvent, inSender);
		// by default, dispatch this event if we are in fact the delegate
		if (inDelegate == this) {
			return this.dispatch(inName, inEvent, inSender);
		}
		return this.bubbleDelegation(inDelegate, inName, inEventName, inEvent, inSender);
	},
	/**
		Dispatch the event to named delegate inMethodName, if it exists.
		Sub-kinds may re-route dispatches.
		Note that both 'handlers' events and events delegated from owned controls
		arrive here. If you need to handle these differently, you may 
		need to also override dispatchEvent.
	*/
	dispatch: function(inMethodName, inEvent, inSender) {
		var fn = inMethodName && this[inMethodName];
		if (fn) {
			return fn.call(this, inSender || this, inEvent);
		}
	},
	/**
		Sends a message to myself and my descendants.
	*/
	waterfall: function(inMessageName, inMessage, inSender) {
		//this.log(inMessageName, (inSender || this).name, "=>", this.name);
		if (this.dispatchEvent(inMessageName, inMessage, inSender)) {
			return true;
		}
		this.waterfallDown(inMessageName, inMessage, inSender || this);
	},
	/**
		Sends a message to my descendants.
	*/
	waterfallDown: function(inMessageName, inMessage, inSender) {
		for (var n in this.$) {
			this.$[n].waterfall(inMessageName, inMessage, inSender);
		}
	}
});

//* @protected

enyo.defaultCtor = enyo.Component;

enyo.create = enyo.Component.create = function(inConfig) {
	if (!inConfig.kind && ("kind" in inConfig)) {
		throw "enyo.create: Attempt to create a null kind. Check dependencies.";
	}
	var kind = inConfig.kind || inConfig.isa || enyo.defaultCtor;
	var ctor = enyo.constructorForKind(kind);
	if (!ctor) {
		console.error('no constructor found for kind "' + kind + '"');
		ctor = enyo.Component;
	}
	return new ctor(inConfig);
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
			console.warn("enyo.Component.addEvent: event names must start with 'on'. " + inProto.kindName + " event '" + inName + "' was auto-corrected to 'on" + inName + "'.");
			inName = "on" + inName;
		}
		v = inValue;
		fn = "do" + enyo.cap(inName.slice(2));
	}
	inProto[inName] = v;
	if (!inProto[fn]) {
		inProto[fn] = function(inEvent) {
			// bubble this event
			return this.bubble(inName, inEvent);
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