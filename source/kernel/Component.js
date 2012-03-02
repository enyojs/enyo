/**
	_enyo.Component_ is the fundamental building block for Enyo applications. Components are designed to fit together, so complex behaviors
	can be composed from smaller bits of functionality.

	## Configurations

	Component constructors take a single argument, a JavaScript object that defines various properties to initialize on the Component.
	Sometimes we call this argument a _Component configuration_.

		// create a new component, initialize its name property to 'me'.
		var c = new enyo.Component({
			name: "me"
		});

	When a Component is instantiated, configurations in its _components_ property are instantiated, too. For example,

		// create a new component, which has one of its own components
		var c = new enyo.Component({
			name: "me",
			components: [
				{kind: "Component", name: "other"}
			]
		});
	
	In this case, when _me_ is created, _other_ is created, too, and we say that _me owns other_.
	In other words, the _owner_ property of _other_ equals _me_. Notice that you can specify the _kind_ 
	of _other_ explicitly in its configuration block, to tell _me_ what constructor to use to create _other_.

	Note that _kind_ values can be references to actual kinds or string-names of kinds. Kind names that
	do not resolve directly to kinds are looked up in default namespaces. In this case, _kind: "Component"_ resolves 
	to _enyo.Component_.
	
	## Owner

	Ownership allows components to be organized into trees. For example,

	* Component A
		* Component B (owner: A)
		* Component C (owner: A)
			* Component E (owner: C)
		* Component D (owner A)

	Note that, when designing code, a Component should only be concerned with the Components it owns (one level down). 
	The coder never needs to concern herself with the complex tree structure that will exist at runtime. For example,
	Component A will never reference Component E directly; it will only access the interface supplied by Component C.

	The ownership status of a Component is controlled by the _owner_ property. In other words, to change ownership of a Component,
	use the _setOwner_ method.

	Every Component has a name. A Component's name must be unique among all Components in its owner. In other words, a Component
	can't own two components with the same name. A Component can access its owned components by name using the _$_ hash.

	For example, if a Component owns components named 'componentB' and 'componentC', it can refer to them with code like this:

		someMethod: function() {
			this.$.componentB.doWork();
			this.$.componentC.doWork();
		}

	Sometimes we refer to the set of objects in the _$_ hash as the _scope_ of a Component.

	Note that all Components visible in the _components_ property will be owned by the top level component. For example,

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

	Although Components _third_ and _fourth_ are nested inside the configuration for _other_, they are still owned by _me_.
	This concept is important; it means that whatever Components you can see listed are in scope.

	The _me_ component might have a complex configuration, but at a glance I can see that it has access to 
	_other_, _third_, and _fourth_ to get its work done. Those objects will available in the _$_ hash.

	## Events

	A Component can send a message to its owner using the _event_ mechanism. A Component exposes events as string properties whose
	names begin with 'on'. To listen to messages, a Component can assign the name of one of its methods to the event property of 
	an owned Component.
	
	For example, the WebService component has an _onSuccess_ property. The owner of a WebService can set _onSuccess_ to the name of a method
	to be called when the WebService operation completes successfully.

		// create a new component, which has a Component of its own, and listens to an event
		var c = new enyo.Component({
			name: "MyComponent",
			components: [
				{kind: "WebService", onSuccess: "webSuccess"}
			],
			webSuccess: function(inSender) {
				this.log(inSender.name, "was successful");
			}
		});

	We call _webSuccess_ the _delegate_ for the _success_ event of the WebService. Because the event properties take
	names of methods, we call the event property values _named delegates_.

	Note that the _webSuccess_ method takes an argument called _inSender_ which refers to the object that generated the event.
	Different events may supply additional arguments, but they all supply _inSender_ as the first argument.

	Component events are much like DOM events. In fact, Enyo makes many DOM events available as Component events.
	Remember that Components do not in general represent DOM nodes, but _Controls_ do; see the <a href="#enyo.Control">Control</a> 
	documentation for more information.

	## Create and Destroy

	When a Component is instantiated, and after all constructors are executed, the _create_ method is invoked. 
	During Component.create, all owned Components are created.

	Subclasses of Component often override _create_ to do initialization tasks. If you override Component, make sure to call
	the inherited _create_ method, and remember that owned components (and the _$_ hash) are only ready after the
	inherited method has returned.

		enyo.kind({
			name: "MyComponent",
			kind: enyo.Component,
			create: function() {
				// I can do tasks before my components are created
				this.inherited(arguments);
				// ... or I can do tasks after, my $ hash is ready now
			}
		});

	To delete a Component, use the _destroy_ method. Calling _destroy_ on a component will remove it from all framework
	bookkeeping, and in particular will set owner to NULL. Generally this is enough to allow the object to be garbage 
	collected, unless you have maintained a reference to it yourself.

		allDone: function() {
			// remove workComponent, and do any cleanup
			this.$.workComponent.destroy();
			// now this.$.workComponent is undefined
		}

	You may override the _destroy_ method to include custom clean-up code. Again, you must make sure to call the inherited method
	before returning.

	## Creating Components Dynamically

	The _createComponent_ and _createComponents_ methods are included to create Components dynamically.
	Refer to the inline documentation on those methods for more information.
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
		Removes this Component from its owner (set owner to null) and does any
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
		var i = this._componentNameMap[prefix] || 0;
		// find an available name
		do {
			var n = prefix + (++i > 1 ? String(i) : "");
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
		Returns an Array of owned components. In other words, converts the _$_ hash into an array and returns the array.
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
		Creates and returns a Component as defined by the combination of _inInfo_ and _inMoreInfo_.
		The created Component passes through initialization machinery provided by the
		creating Component, which may supply special handling.
		Unless the owner is explicitly specified, the new Component will be owned by _this_.
		Properties in _inInfo_ override properties in _inMoreInfo_.

			// create a new component named _dynamic_ owned by _this_ 
			// (will be available as this.$.dynamic).
			this.createComponent({name: "dynamic"});

			// create a new component named _another_ owned by _other_ 
			// (will be available as other.$.another).
			this.createComponent({name: "another"}, {owner: other});
	*/
	createComponent: function(inInfo, inMoreInfo) {
		// createComponent and createComponents both delegate to the protected method (_createComponent),
		// allowing overrides to customize createComponents and createComponents separately.
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
		Bubble an event up an object chain, starting with _this_.

		If a handler for this event returns true (aka _handled_)
		bubbling is stopped.

		Handlers always have this signature:

			function(inSender, inEvent)

		Where inSender refers to the Component that most recently 
		propagated the event and inEvent is an object containing 
		event information.

		inEvent will have at least one property, _originator_ which
		references the Component which triggered the event in the
		first place.
	*/
	bubble: function(inEventName, inEvent, inSender) {
		/*
		if ({ontap:1, Xonenter: 1, Xonleave: 1}[inEventName]) {
			this.log(inEventName, (inSender || this).name, "=>", this.name);
		}
		*/
		var e = inEvent || {};
		e.originator = null;
		// FIXME: is this the right place?
		if (!e.originator) {
			e.originator = inSender || this;
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
		Bubble an event up an object chain, starting <b>above</b> _this_.

		If a handler for this event returns true (aka _handled_)
		bubbling is stopped.

		Handlers always have this signature:

			function(inSender, inEvent)

		Where inSender refers to the Component that most recently 
		propagated the event and inEvent is an object containing 
		event information.

		inEvent will have at least one property, _originator_ which
		references the Component which triggered the event in the
		first place.
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
	dispatchEvent: function(inEventName, inEvent, inSender) {
		// try internal handler (from inSender)
		if (this.dispatch(this, this.handlers[inEventName], inEvent, inSender)) {
			return true;
		}
		// try owner handler (from 'this')
		return this.dispatch(this.owner, this[inEventName], inEvent, this);
	},
	dispatch: function(inObject, inMethodName, inEvent, inSender) {
		var fn = inObject && inMethodName && inObject[inMethodName];
		if (fn) {
			return fn.call(inObject, inSender || this, inEvent);
		}
	},
	/**
		Send a message to myself and my descendents
	*/
	waterfall: function(inMessageName, inMessage, inSender) {
		//this.log(inMessageName, (inSender || this).name, "=>", this.name);
		if (this.dispatchEvent(inMessageName, inMessage, inSender)) {
			return true;
		}
		this.waterfallDown(inMessageName, inMessage, inSender || this);
	},
	/**
		Send a message to my descendents
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