(function (enyo, scope) {
	
	var kind = enyo.kind,
		unnamedCounter = 0,
		kindPrefix = {};
	
	var eObject = enyo.Object,
		ApplicationSupport = enyo.ApplicationSupport,
		ComponentBindingSupport = enyo.ComponentBindingSupport;
	
	/**
		{@link enyo.Component} is the fundamental building block for Enyo applications. Components
		are designed to fit together, allowing complex behaviors to be fashioned from smaller bits
		of functionality.

		Component constructors take a single argument (sometimes called a _{@link enyo.Component}
		configuration_), a JavaScript object that defines various properties to be initialized on
		the {@link enyo.Component}. For example:

		@example
		// create a new component, initialize its name property to 'me'
		var c = new enyo.Component({
			name: 'me'
		});

		When a Component is instantiated, items configured in its _components_
		property are instantiated, too:

		@example
		// create a new component, which itself has a component
		var c = new enyo.Component({
			name: 'me',
			components: [
				{kind: 'Component', name: 'other'}
			]
		});

		In this case, when _me_ is created, _other_ is also created, and we say that _me owns
		other_. In other words, the _owner_ property of _other_ equals _me_. Notice that you can
		specify the _kind_ of _other_ explicitly in its configuration block, to tell _me_ what
		constructor to use to create _other_.

		Note that _kind_ values may be references to actual kinds or string-names of kinds. Kind
		names that do not resolve directly to kinds are looked up in default namespaces. In this
		case, `kind: 'Component'` resolves to `enyo.Component`.

		To move a component, use the _setOwner_ method to change the component's owner. If you want
		to make a component unowned, use _setOwner(null)_.

		If you make changes to _enyo.Component_, be sure to add or update the appropriate
		{@linkplain https://github.com/enyojs/enyo/tree/master/tools/test/core/tests unit tests}.

		For more information, see the documentation on
		{@linkplain key-concepts/creating-components.html Components} in the Enyo Developer Guide.
	
		@public
		@class enyo.Component
		@extend enyo.Object
	*/
	var Component = kind(
		/** @lends enyo.Component.prototype */ {
		
		/**
			@private
		*/
		name: 'enyo.Component',
		
		/**
			@private
		*/
		kind: eObject,
		
		/**
			@private
		*/
		noDefer: true,
		
		/**
			@private
		*/
		published: {
			
			/**
				A unique name for the component within its owner. This is used to set the access
				name in the owner's _$_ hash.  If not specified, a default name will be provided
				based on the name of the object's kind, optionally with a number suffix if more than
				one instance exists in the owner.
			
				@public
				@memberof enyo.Component.prototype
				@default ''
				@type {String}
			*/
			name: '',
			
			/**
				A unique id for the component, usually automatically generated based on its position
				within the component hierarchy, although it may also be directly specified.
				{@link enyo.Control} uses this id value for the DOM id attribute.
			
				@public
				@memberof enyo.Component.prototype
				@default ''
				@type {String}
			*/
			id: '',
			
			/**
				The component that owns this component. It is usually implicitly defined during
				creation based on the _createComponent_ call or _components_ hash.
				
				@public
				@memberof enyo.Component.prototype
				@default null
				@type {enyo.Component}
			*/
			owner: null,
			
			/**
				This can be a hash of features to apply to chrome components of the base kind. They
				are matched by _name_ (if the component you wish to modify does not have a _name_
				this will not work). You can modify any properties of the component except for
				_methods_. Setting this at runtime will have no affect.
				
				@public
				@memberof enyo.Component.prototype
				@default null
				@type {Object}
			*/
			componentOverrides: null
		},
		
		/**
			@private
		*/
		defaultKind: 'Component',
		
		/**
			@private
		*/
		handlers: {},
		
		/**
			@private
		*/
		mixins: [ApplicationSupport, ComponentBindingSupport],
		
		/**
			@private
		*/
		toString: function () {
			return this.id + ' [' + this.kindName + ']';
		},
		
		/**
			@private
		*/
		constructor: enyo.inherit(function (sup) {
			return function (props) {
				// initialize instance objects
				this._componentNameMap = {};
				this.$ = {};
				sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		constructed: enyo.inherit(function (sup) {
			return function (props) {
				// perform initialization
				this.create(props);
				sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		create: function () {
			// stop and queue all of the notifications happening synchronously to allow
			// responders to only do single passes on work traversing the tree
			this.stopNotifications();
			this.ownerChanged();
			this.initComponents();
			// release the kraken!
			this.startNotifications();
		},
		
		/**
			@private
		*/
		initComponents: function () {
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
		
		/**
			@private
		*/
		createChrome: function (comps) {
			this.createComponents(comps, {isChrome: true});
		},
		
		/**
			@private
		*/
		createClientComponents: function (comps) {
			this.createComponents(comps, {owner: this.getInstanceOwner()});
		},
		
		/**
			@private
		*/
		getInstanceOwner: function () {
			return (!this.owner || this.owner.notInstanceOwner) ? this : this.owner;
		},
		
		/**
			Removes this component from its owner (sets _owner_ to null) and does any necessary 
			cleanup. The component is flagged with a _destroyed: true_ property. Usually, the
			component will be suitable for garbage collection after being destroyed, unless user
			code keeps a reference to it.
		
			@public
			@method
			@returns {this} Callee for chaining.
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				this.destroyComponents();
				this.setOwner(null);
				sup.apply(this, arguments);
				this.stopAllJobs();
				return this;
			};
		}),
		
		/**
			Destroys all owned components.
		
			@public
			@method
			@returns {this} Callee for chaining.
		*/
		destroyComponents: function () {
			var comps = this.getComponents(),
				comp,
				i;
				
			for (i = 0; i < comps.length; ++i) {
				comp = comps[i];
				// @todo: previous comment said list might be stale and ownership may have caused
				// components to be destroyed as a result of some inner-container...look into this
				// because that seems incorrect or avoidable
				if (!comp.destroyed) comp.destroy();
			}
			
			return this;
		},
		
		/**
			@private
		*/
		makeId: function() {
			var delim = '_', pre = this.owner && this.owner.getId(),
				baseName = this.name || ('@@' + (++unnamedCounter));
			return (pre ? pre + delim : '') + baseName;
		},
		
		/**
			@private
		*/
		ownerChanged: function (was) {
			if (was && was.removeComponent) was.removeComponent(this);
			if (this.owner && this.owner.addComponent) this.owner.addComponent(this);
			if (!this.id) this.id = this.makeId();
		},
		
		/**
			@private
		*/
		nameComponent: function (comp) {
			var pre = prefixFromKindName(comp.kindName),
				last = this._componentNameMap[pre] || 0,
				nom;
			
			do {
				nom = pre + (++last > 1 ? String(last) : '');
			} while (this.$[nom]);
			
			this._componentNameMap[pre] = Number(last);
			return (comp.name = nom);
		},
		
		/**
			Adds _inComponent_ to the list of components owned by the current component (i.e.,
			_this.$_).
		
			@public
			@method
			@param {enyo.Component} comp The {@link enyo.Component} to add.
			@returns {this} Callee for chaining.
		*/
		addComponent: function (comp) {
			var nom = comp.get('name');
			
			// if there is no name we have to come up with a generic name
			if (!nom) nom = this.nameComponent(comp);
			
			// if there already was a component by that name we issue a warning
			// @todo: if we're going to name rules being violated we need to normalize this approach
			// and ensure we have one for every warning/error we throw
			if (this.$[nom]) this.warn(
				'Duplicate component name ' + nom + ' in owner ' + this.id + ' violates ' +
				'unique-name-under-owner rule, replacing existing component in the hash and ' +
				'continuing, but this is an error condition and should be fixed.'
			);
				
			this.$[nom] = comp;
			this.notify('$.' + nom, null, comp);
			
			// if the component has the `publish` true property then we also create a reference to
			// it directly on the owner (this)
			if (comp.publish) {
				this[nom] = comp;
				
				// and to ensure that bindings are aware we have to notify them as well
				this.notify(nom, null, comp);
			}
			
			return this;
		},
		
		/**
			Removes the {@link enyo.Component} from those known to be owned by this
			{@link enyo.Component}. This includes removing it from the {@link enyo.Component#"$"}
			special property and from the {@link enyo.Component#owner owner} (this) directly if set
			{@link enyo.Component#publish} `true`.
		
			@public
			@method
			@param {enyo.Component} comp The component to remove.
			@returns {this} Callee for chaining.
		*/
		removeComponent: function (comp) {
			var nom = comp.get('name');
			
			// remove it from the hash if it existed
			delete this.$[nom];
			
			// if it was published remove it from the component proper
			if (comp.publish) delete this[nom];
			
			return this;
		},
		
		/**
			Returns an array of owned components; in other words, converts the _$_ hash into an
			array and returns the array.
		
			@public
			@method
			@returns {enyo.Component[]} The {@link enyo.Component components} found in the
				{@link enyo.Component#"$"} hash.
		*/
		getComponents: function () {
			return enyo.values(this.$);
		},
		
		/**
			@private
		*/
		adjustComponentProps: function (props) {
			if (this.defaultProps) enyo.mixin(props, this.defaultProps, {ignore: true});
			props.kind = props.kind || props.isa || this.defaultKind;
			props.owner = props.owner || this;
		},
		
		/**
			@private
		*/
		_createComponent: function (props, ext) {
			var def = ext ? enyo.mixin({}, [ext, props]) : enyo.clone(props);
			
			// always adjust the properties according to the needs of the kind and parent kinds
			this.adjustComponentProps(def);
			
			// pass along for the final stage
			return Component.create(def);
		},
		
		/**
			Creates and returns a component as defined by the combination of _inInfo_ and
			_inMoreInfo_. Properties in _inInfo_ override properties in _inMoreInfo_.

			The created component passes through initialization machinery provided by the creating
			component, which may supply special handling. Unless the owner is explicitly specified,
			the new component will be owned by the instance on which _createComponent_ is called.
			
			@example
			// Create a new component named _dynamic_ owned by _this_
			// (will be available as this.$.dynamic).
			this.createComponent({name: 'dynamic'});
			
			@example
			// Create a new component named _another_ owned by _other_
			// (will be available as other.$.another).
			this.createComponent({name: 'another'}, {owner: other});
		
			@public
			@method
			@param {Object} props The declarative {@link enyo#kind} definition.
			@param {Object} ext Additional properties to be applied (defaults).
			@returns {enyo.Component} The instance created with the given parameters.
		*/
		createComponent: function (props, ext) {
			// createComponent and createComponents both delegate to the protected method
			// (_createComponent), allowing overrides to customize createComponent and
			// createComponents separately.
			return this._createComponent(props, ext);
		},
		
		/**
			Creates Component objects as defined by the array of configurations
			_inInfos_. Each configuration in _inInfos_ is combined with _inCommonInfo_,
			as described in _createComponent_.

			Returns an array of references to the created components.

			@example
			// ask foo to create components _bar_ and _zot_, but set the owner of
			// both components to _this_.
			this.$.foo.createComponents([
				{name: 'bar'},
				{name: 'zot'}
			], {owner: this});
		
			@public
			@method
			@param {Object[]} props The array of {@link enyo.Component} definitions to be created.
			@param {Object} ext Additional properties to be supplied as defaults for each.
			@returns {enyo.Component[]} The array of {@link enyo.Component components} that were
				created.
		*/
		createComponents: function (props, ext) {
			var comps = [],
				comp,
				i;
				
			if (props) {
				for (i = 0; i < props.length; ++i) {
					comp = props[i];
					comps.push(this._createComponent(comp, ext));
				}
			}
			
			return comps;
		},
		
		/**
			@private
		*/
		getBubbleTarget: function () {
			return this.bubbleTarget || this.owner;
		},
		
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
		
			@public
			@method
			@param {String} nom The name of the event to bubble.
			@param {Object} [event] The event object to be passed along while bubbling.
			@param {enyo.Component} [sender=this] The {@link enyo.Component} responsible for
				bubbling the event.
			@returns {Boolean} `false` if unhandled or uninterrupted, `true` otherwise.
		*/
		bubble: function (nom, event, sender) {
			if (!this._silenced) {
				event = event || {};
				// deliberately done this way
				if (event.originator == null) event.originator = sender || this;
				return this.dispatchBubble(nom, event, sender || this);
			}
			return false;
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
		
			@public
			@method
			@param {String} nom The name of the event.
			@param {Object} [event] The event properties to pass along while bubbling.
			@returns {Boolean} `false` if unhandled or uninterrupted, `true` otherwise.
		*/
		bubbleUp: function (nom, event) {
			var next;
			
			if (!this._silenced) {
				event = event || {};
				next = this.getBubbleTarget();
				if (next) {
					// use delegate as sender if it exists to preserve illusion
					// that event is dispatched directly from that, but we still
					// have to bubble to get decorations
					return next.dispatchBubble(nom, event, event.delegate || this);
				}
			}
			return false;
		},
		
		/**
			Sends an event to a named delegate. This object may dispatch an event
			to itself via a handler, or to its owner via an event property, e.g.:

				handlers {
					// 'tap' events dispatched to this.tapHandler
					ontap: 'tapHandler'
				}

				// 'tap' events dispatched to 'tapHandler' delegate in this.owner
				ontap: 'tapHandler'
		
			@private
		*/
		dispatchEvent: function (nom, event, sender) {
			var delegate,
				ret;
			
			if (!this._silenced) {
				// if the event has a delegate associated with it we grab that
				// for reference
				// NOTE: This is unfortunate but we can't use a pooled object here because
				// we don't know where to release it
				delegate = (event || (event = {})).delegate;
				ret;
				// bottleneck event decoration w/ optimization to avoid call to empty function
				if (this.decorateEvent !== Component.prototype.decorateEvent) {
					this.decorateEvent(nom, event, sender);
				}

				// first, handle any delegated events intended for this object
				if (delegate && delegate.owner === this) {
					// the most likely case is that we have a method to handle this
					if (this[nom] && 'function' === typeof this[nom]) {
						return this.dispatch(nom, event, sender);
					}
					// but if we don't, just stop the event from going further
					return false;
				}

				// for non-delgated events, try the handlers block if possible
				if (!delegate) {
					if (this.handlers && this.handlers[nom] &&
						this.dispatch(this.handlers[nom], event, sender)) {
						return true;
					}
					// then check for a delegate property for this event
					if (this[nom] && enyo.isString(this[nom])) {
						// we dispatch it up as a special delegate event with the
						// component that had the delegation string property stored in
						// the 'delegate' property
						event.delegate = this;
						ret = this.bubbleUp(this[nom], event, sender);
						delete event.delegate;
						return ret;
					}
				}
			}
			return false;
		},
		
		/**
			internal - try dispatching event to self, if that fails bubble it up the tree
			@private
		*/
		dispatchBubble: function (nom, event, sender) {
			if (!this._silenced) {
				// Try to dispatch from here, stop bubbling on truthy return value
				if (this.dispatchEvent(nom, event, sender)) {
					return true;
				}
				// Bubble to next target
				return this.bubbleUp(nom, event, sender);
			}
			return false;
		},
		
		/**
			@private
		*/
		decorateEvent: function (nom, event, sender) {
			// an event may float by us as part of a dispatchEvent chain
			// both call this method so intermediaries can decorate inEvent
		},
		
		/**
			@private
		*/
		stopAllJobs: function () {
			var job;
			
			if (this.__jobs) for (job in this.__jobs) this.stopJob(job);
		},
		
		/**
			Dispatches the event to named delegate _inMethodName_, if it exists.
			Subkinds may re-route dispatches.
			Note that both 'handlers' events and events delegated from owned controls
			arrive here. If you need to handle these differently, you may also need
			to override _dispatchEvent_.
		
			@public
			@method
			@param {String} nom The method name to dispatch the event.
			@param {Object} [event] The event object to pass along.
			@param {enyo.Component} [sender=this] The originator of the event.
		*/
		dispatch: function (nom, event, sender) {
			var fn;
			
			if (!this._silenced) {
				fn = nom && this[nom];
				if (fn && typeof fn == 'function') {
					// @todo: deprecate sender
					return fn.call(this, sender || this, event);
				}
			}
			return false;
		},
		
		/**
			Triggers the handler for a given event type.

			@example
			myControl.triggerHandler('ontap');
		
			@public
			@method
			@param {String} nom The name of the event to trigger.
			@param {Object} [event] The event object to pass along.
			@param {enyo.Component} [sender=this] The originator of the event.
			@returns {Boolean} `false` if unhandled or uninterrupted, `true` otherwise.
		*/
		triggerHandler: function () {
			return this.dispatchEvent.apply(this, arguments);
		},
		
		/**
			Sends a message to myself and all of my components. You can stop a waterfall into
			components owned by a receiving object by returning a truthy value from the event
			handler.
			
			@public
			@method
			@param {String} nom The name of the event to waterfall.
			@param {Object} [event] The event object to pass along.
			@param {enyo.Component} [sender=this] The originator of the event.
			@returns {this} Callee for chaining.
		*/
		waterfall: function(nom, event, sender) {
			if (!this._silenced) {
				event = event || {};
				
				// give the locals an opportunity to interrupt the event
				if (this.dispatchEvent(nom, event, sender)) return true;
				
				// otherwise carry on
				this.waterfallDown(nom, event, sender || this);
			}
			
			return this;
		},
		
		/**
			Sends a message to all of my components, but not myself. You can stop a waterfall into
			components owned by a receiving object by returning a truthy value from the event
			handler.
		
			@public
			@method
			@param {String} nom The name of the event.
			@param {Object} [event] The event object to pass along.
			@param {enyo.Component} [sender=this] The event originator.
			@returns {this} Callee for chaining.
		*/
		waterfallDown: function(nom, event, sender) {
			var comp;
			
			if (!this._silenced) {
				for (comp in this.$) this.$[comp].waterfall(nom, event, sender || this);
			}
			
			return this;
		},
		
		/**
			@private
		*/
		_silenced: false,
		
		/**
			@private
		*/
		_silenceCount: 0,
		
		/**
			Sets a flag that disables event propagation for this component. Also increments an
			internal counter that tracks the number of times the _unsilence_ method must be called
			before event propagation will continue.
		
			@public
			@method
			@returns {this} Callee for chaining.
		*/
		silence: function () {
			this._silenced = true;
			this._silenceCount += 1;
			
			return this;
		},
		
		/**
			Returns `true` if the object is currently _silenced_ and will not propagate events (of
			any kind) otherwise `false`.
		
			@public
			@method
			@returns {Boolean} `true` if silenced, `false` otherwise.
		*/
		isSilenced: function () {
			return this._silenced;
		},
		
		/**
			Allows event propagation for this component if the internal silence counter is 0;
			otherwise, decrements the counter by one. For event propagation to resume, this method
			must be called one time for each call to _silence_.
		
			@public
			@method
			@returns {Boolean} `true` if the {@link enyo.Component} is now unsilenced completely,
				`false` if it remains silenced.
		*/
		unsilence: function () {
			if (0 !== this._silenceCount) --this._silenceCount;
			if (0 === this._silenceCount) this._silenced = false;
			return !this._silenced;
		},
		
		/**
			Creates a new job tied to this instance of the component. If the component
			is destroyed, any jobs associated with it will be stopped.

			If you start a job with the same name as a pending job, the original job
			will be stopped; this can be useful for resetting timeouts.

			You may supply a priority level (1-10) at which the job should be executed.
			The default level is 5. Setting the priority lower than 5 (or setting it to
			the string 'low') will defer the job if an animation is in progress, which
			can help to avoid stuttering.
		
			@public
			@method
			@param {String} nom The name of the job to start.
			@param {(Function|String)} job Either the name of a method or a function to execute as
				the requested job.
			@param {Number} wait The number of milliseconds to wait before starting the job.
			@param {Number} [priority=5] The priority value to be associated with this job.
			@returns {this} Callee for chaining.
		*/
		startJob: function(nom, job, wait, priority) {
			var jobs = (this.__jobs = this.__jobs || {});
			priority = priority || 5;
			// allow strings as job names, they map to local method names
			if (typeof job == 'string') job = this[job];
			// stop any existing jobs with same name
			this.stopJob(nom);
			jobs[nom] = setTimeout(this.bindSafely(function() {
				enyo.jobs.add(this.bindSafely(job), priority, nom);
			}), wait);
			
			return this;
		},
		
		/**
			Stops a component-specific job before it has been activated.
			
			@public
			@method
			@param {String} nom The name of the job to be stopped.
			@returns {this} Callee for chaining.
		*/
		stopJob: function(nom) {
			var jobs = (this.__jobs = this.__jobs || {});
			if (jobs[nom]) {
				clearTimeout(jobs[nom]);
				delete jobs[nom];
			}
			enyo.jobs.remove(nom);
		},
		
		/**
			Execute the method _inJob_ immediately, then prevent any other calls to throttleJob with
			the same _inJobName_ from running for the next _inWait_ milliseconds.
		
			@public
			@method
			@param {String} nom The name of the job to throttle.
			@param {(Function|String)} job Either the name of a method or a function to execute as
				the requested job.
			@param {Number} wait The number of milliseconds to wait before executing the job again.
			@returns {this} Callee for chaining.
		*/
		throttleJob: function(nom, job, wait) {
			var jobs = (this.__jobs = this.__jobs || {});
			// if we still have a job with this name pending, return immediately
			if (!jobs[nom]) {
				// allow strings as job names, they map to local method names
				if (typeof job == 'string') job = this[job];
				job.call(this);
				jobs[nom] = setTimeout(this.bindSafely(function() {
					this.stopJob(nom);
				}), wait);
			}
			return this;
		}
	});

	/**
		@private
	*/
	enyo.defaultCtor = Component;

	/**
		Creates new instances from config objects. This method looks up the proper constructor based
		on the provided _kind_ attribute.
	
		@public
		@name enyo.create
		@memberof enyo
		@param {Object} props The properties that define the {@link enyo#kind}.
		@returns {*} An instance of the requested {@link enyo#kind}.
	*/
	enyo.create = Component.create = function(props) {
		var kind,
			ctor;
		
		if (!props.kind && props.hasOwnProperty('kind')) throw new Error(
			'enyo.create: Attempt to create a null kind. Check dependencies for [' + def.name + ']'
		);
		
		kind = props.kind || props.isa || enyo.defaultCtor;
		ctor = enyo.constructorForKind(kind);
		
		if (!ctor) {
			enyo.error('No constructor found for kind ' + kind);
			ctor = Component;
		}
		
		return new ctor(props);
	};

	/**
		@private
	*/
	Component.subclass = function(ctor, props) {
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
				proto.kindComponents = Component.overrideComponents(
					proto.kindComponents,
					props.componentOverrides,
					proto.defaultKind
				);
			}
		}
	};

	/**
		@private
	*/
	Component.concat = function (ctor, props) {
		var proto = ctor.prototype || ctor,
			handlers;
		if (props.handlers) {
			handlers = proto.handlers ? enyo.clone(proto.handlers) : {};
			proto.handlers = enyo.mixin(handlers, props.handlers);
			delete props.handlers;
		}
		if (props.events) Component.publishEvents(proto, props);
	};

	Component.overrideComponents = function(components, overrides, defaultKind) {
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
				var b = (c.kind && ((typeof c.kind == 'string' && enyo.getPath(c.kind)) || (typeof c.kind == 'function' && c.kind))) || enyo.defaultCtor;
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

	/**
		@private
	*/
	Component.publishEvents = function(ctor, props) {
		var events = props.events,
			event,
			proto;
		if (events) {
			proto = ctor.prototype || ctor;
			for (event in events) Component.addEvent(event, events[event], proto);
		}
	};

	Component.addEvent = function(inName, inValue, inProto) {
		var v, fn;
		if (!enyo.isString(inValue)) {
			v = inValue.value;
			fn = inValue.caller;
		} else {
			if (inName.slice(0, 2) != 'on') {
				enyo.warn('enyo.Component.addEvent: event names must start with "on". ' + inProto.kindName + ' ' +
					'event "' + inName + '" was auto-corrected to "on' + inName + '".');
				inName = 'on' + inName;
			}
			v = inValue;
			fn = 'do' + enyo.cap(inName.slice(2));
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

	/**
		@private
	*/
	function prefixFromKindName (nom) {
		var pre = kindPrefix[nom],
			last;
			
		if (!pre) {
			last = nom.lastIndexOf('.');
			pre = (last >= 0) ? nom.slice(last+1) : nom;
			pre = pre.charAt(0).toLowerCase() + pre.slice(1);
			kindPrefix[nom] = pre;
		}
		
		return pre;
	};
	
})(enyo, this);