(function (enyo, scope) {
	
	var kind = enyo.kind
		, unnamedCounter = 0
		, kindPrefix = {};
	
	var eObject = enyo.Object
		, ApplicationSupport = enyo.ApplicationSupport
		, ComponentBindingSupport = enyo.ComponentBindingSupport;

	/**
	* @callback enyo.Component~EventHandler
	* @param {enyo.Component} sender The [component]{@link enyo.Component} that most recently
	*	propagated the [event]{@link external:event}.
	* @param {Object} event An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @returns {Boolean} A value indicating whether the [event]{@link external:event} has been
	*	handled or not. If `true`, then bubbling is stopped.
	*/

	/**
	* A [hash]{@link external:Object} of references to all the [components]{@link enyo.Component} 
	* owned by this [component]{@link enyo.Component}. This property is updated whenever a new
	* [component]{@link enyo.Component} is added; the new component can be accessed via its 
	* [name]{@link enyo.Component#name} property. Additionally, we can also observe changes on
	* properties of [components]{@link enyo.Component} referenced by the _$_ property.
	*
	* Component access via the $ hash:
	* ```javascript
	* var c = new enyo.Component({
	*	name: 'me',
	*	components: [
	*		{kind: 'Component', name: 'other'}
	*	]
	* });
	*
	* // We can now access 'other' on the $ hash of 'c', via c.$.other
	* ```
	*
	* Observing changes on a component referenced by the $ property:
	* ```javascript
	* var c = new enyo.Component({
	*	name: 'me',
	*	components: [
	*		{kind: 'Component', name: 'other'}
	*	]
	* });
	*
	* c.addObserver('$.other.active', function() {
	*	// do something to respond to the "active" property of "other" changing
	* })
	*
	* c.$.other.set('active', true); // this will trigger the observer to run its callback
	* ```
	* 
	* @name $
	* @type {Object}
	* @default null
	* @memberof enyo.Component.prototype
	* @readonly
	* @public
	*/

	/**
	* If `true`, this [component's]{@link enyo.Component} [owner]{@link enyo.Component#owner} will
	* have a direct name reference to the owned [component]{@link enyo.Component}.
	*
	* @example
	* var c = new enyo.Component({
	*	name: 'me',
	*	components: [
	*		{kind: 'Component', name: 'other', publish: true}
	*	]
	* });
	*
	* // We can now access 'other' directly, via c.other
	* 
	* @name publish
	* @type {Boolean}
	* @default undefined
	* @memberOf enyo.Component.prototype
	* @public
	*/

	/**
	* If `true`, the [layout]{@link external:layout} strategy will adjust the size of this 
	* [component]{@link enyo.Component} to occupy the remaining available space.
	* 
	* @name fit
	* @type {Boolean}
	* @default undefined
	* @memberOf enyo.Component.prototype
	* @public
	*/
	
	/**
	* {@link enyo.Component} is the fundamental building block for Enyo applications. 
	* [Components]{@link enyo.Component} are designed to fit together, allowing complex behaviors to
	* be fashioned from smaller bits of functionality.
	* 
	* [Component]{@link enyo.Component} [constructors]{@link external:constructor} take a single 
	* argument (sometimes called an {@link enyo.Component} 
	* [configuration]{@link external:configurationBlock}), a JavaScript 
	* [object]{@link external:Object} that defines various properties to be initialized on the 
	* {@link enyo.Component}. For example:
	* 
	* ```javascript
	* // create a new component, initialize its name property to 'me'
	* var c = new enyo.Component({
	*	name: 'me'
	* });
	* ```
	* 
	* When a [Component]{@link enyo.Component} is instantiated, items configured in its 
	* [components]{@link enyo.Component#components} property are instantiated, too:
	* 
	* ```javascript
	* // create a new component, which itself has a component
	* var c = new enyo.Component({
	*	name: 'me',
	*	components: [
	*		{kind: 'Component', name: 'other'}
	*	]
	* });
	* ```
	* 
	* In this case, when _me_ is created, _other_ is also created, and we say that _me owns other_. 
	* In other words, the [owner]{@link enyo.Component#owner} property of _other_ equals _me_. 
	* Notice that you can specify the [kind]{@link external:kind} of _other_ explicitly in its
	* [configuration block]{@link external:configurationBlock}, to tell _me_ what 
	* [constructor]{@link external:constructor} to use to create _other_.
	* 
	* Note that [kind]{@link external:kind} values may be references to actual 
	* [kinds]{@link external:kind} or string-names of [kinds]{@link external:kind}. 
	* [Kind]{@link external:kind} names that do not resolve directly to [kinds]{@link external:kind}
	* are looked up in default namespaces. In this case, `kind: 'Component'` resolves to 
	* `enyo.Component`.
	* 
	* To move a [component]{@link enyo.Component}, use the `setOwner` method to change the 
	* [component's]{@link enyo.Component} [owner]{@link enyo.Component#owner}. If you want to make a
	* [component]{@link enyo.Component} unowned, use `setOwner(null)`.
	* 
	* If you make changes to {@link enyo.Component}, be sure to add or update the appropriate
	* {@linkplain https://github.com/enyojs/enyo/tree/master/tools/test/core/tests unit tests}.
	* 
	* For more information, see the documentation on
	* {@linkplain key-concepts/creating-components.html Components} in the Enyo Developer Guide.
	* 
	* @class enyo.Component
	* @extends enyo.Object
	* @mixes enyo.ApplicationSupport
	* @mixes enyo.ComponentBindingSupport
	* @public
	*/
	var Component = kind(
		/** @lends enyo.Component.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.Component',
		
		/**
		* @private
		*/
		kind: eObject,
		
		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* @private
		*/
		published: 
			/** @lends enyo.Component.prototype */ {
			
			/**
			* A unique name for the [component]{@link enyo.Component} within its 
			* [owner]{@link enyo.Component#owner}. This is used to set the access name in the 
			* [owner's]{@link enyo.Component#owner} [$ hash]{@link enyo.Component#$}. If not 
			* specified, a default name will be provided based on the name of the 
			* [object's]{@link enyo.Object} [kind]{@link external:kind}, optionally with a number 
			* suffix if more than one instance exists in the [owner]{@link enyo.Component#owner}.
			* 
			* @type {String}
			* @default ''
			* @public
			*/
			name: '',
			
			/**
			* A unique id for the [component]{@link enyo.Component}, usually automatically generated
			* based on its position within the [component]{@link enyo.Component} hierarchy, although
			* it may also be directly specified. {@link enyo.Control} uses this _id_ value for the 
			* DOM [id]@link enyo.Control#id} attribute.
			* 
			* @type {String}
			* @default ''
			* @public
			*/
			id: '',
			
			/**
			* The [component]{@link enyo.Component} that owns this [component]{@link enyo.Component}.
			* It is usually implicitly defined during creation based on the 
			* [createComponent]{@link enyo.Component#createComponent} call or 
			* [components]{@link enyo.Component#components} hash.
			*
			* @type {enyo.Component}
			* @default null
			* @public
			*/
			owner: null,
			
			/**
			* This can be a [hash]{@link external:Object} of features to apply to 
			* [chrome]{@link external:chrome} [components]{@link enyo.Component} of the base 
			* [kind]{@link external:kind}. They are matched by [name]{@link enyo.Component#name} 
			* (if the [component]{@link enyo.Component} you wish to modify does not have a 
			* [name]{@link enyo.Component#name} this will not work). You can modify any properties 
			* of the [component]{@link enyo.Component} except for _methods_. Setting this at runtime
			* will have no effect.
			* 
			* @type {Object}
			* @default null
			* @public
			*/
			componentOverrides: null
		},
		
		/**
		* @private
		*/
		defaultKind: 'Component',
		
		/**
		* @private
		*/
		handlers: {},
		
		/**
		* @private
		*/
		mixins: [ApplicationSupport, ComponentBindingSupport],
		
		/**
		* @private
		*/
		toString: function () {
			return this.id + ' [' + this.kindName + ']';
		},
		
		/**
		* @method
		* @private
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
		* @method
		* @private
		*/
		constructed: enyo.inherit(function (sup) {
			return function (props) {
				// perform initialization
				this.create(props);
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* @private
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
		* @private
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
		* @private
		*/
		createChrome: function (comps) {
			this.createComponents(comps, {isChrome: true});
		},
		
		/**
		* @private
		*/
		createClientComponents: function (comps) {
			this.createComponents(comps, {owner: this.getInstanceOwner()});
		},
		
		/**
		* @private
		*/
		getInstanceOwner: function () {
			return (!this.owner || this.owner.notInstanceOwner) ? this : this.owner;
		},
		
		/**
		* Removes this [component]{@link enyo.Component} from its 
		* [owner]{@link enyo.Component#owner} (sets [owner]{@link enyo.Component#owner} to `null`) 
		* and does any necessary cleanup. The [component]{@link enyo.Component} is flagged with a 
		* _destroyed: true_ property. Usually, the [component]{@link enyo.Component} will be 
		* suitable for garbage collection after being destroyed, unless user code keeps a reference 
		* to it.
		* 
		* @returns {this} The callee for chaining.
		* @method
		* @public
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
		* Destroys all owned [components]{@link enyo.Component}.
		*
		* @returns {this} The callee for chaining.
		* @public
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
		* @private
		*/
		makeId: function() {
			var delim = '_', pre = this.owner && this.owner.getId(),
				baseName = this.name || ('@@' + (++unnamedCounter));
			return (pre ? pre + delim : '') + baseName;
		},
		
		/**
		* @private
		*/
		ownerChanged: function (was) {
			if (was && was.removeComponent) was.removeComponent(this);
			if (this.owner && this.owner.addComponent) this.owner.addComponent(this);
			if (!this.id) this.id = this.makeId();
		},
		
		/**
		* @private
		*/
		nameComponent: function (comp) {
			var pre = prefixFromKindName(comp.kindName),
				last = this._componentNameMap[pre] || 0,
				nom;
			
			do {
				nom = pre + (++last > 1 ? String(last) : '');
			} while (this.$[nom]);
			
			this._componentNameMap[pre] = Number(last);
			/*jshint -W093 */
			return (comp.name = nom);
		},
		
		/**
		* Adds a [component]{@link enyo.Component} to the list of [components]{@link enyo.Component}
		* owned by the current [component]{@link enyo.Component} 
		* (i.e., [this.$]{@link enyo.Component#$}).
		* 
		* @param {enyo.Component} comp The {@link enyo.Component} to add.
		* @returns {this} The callee for chaining.
		* @public
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
		* Removes the {@link enyo.Component} from those known to be owned by this
		* {@link enyo.Component}. This includes removing it from the [$ hash]{@link enyo.Component#$} 
		* and from the [owner]{@link enyo.Component#owner} directly if {@link enyo.Component#publish} 
		* is set to `true`.
		* 
		* @param {enyo.Component} comp The component to remove.
		* @returns {this} Callee for chaining.
		* @public
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
		* Returns an [array]{@link external:Array} of owned [components]{@link enyo.Component}; in 
		* other words, converts the [$ hash]{@link enyo.Component#$} into an 
		* [array]{@link external:Array} and returns the [array]{@link external:Array}.
		* 
		* @returns {enyo.Component[]} The [components]{@link enyo.Component} found in the
		*	[$ hash]{@link enyo.Component#$}.
		* @public
		*/
		getComponents: function () {
			return enyo.values(this.$);
		},
		
		/**
		* @private
		*/
		adjustComponentProps: function (props) {
			if (this.defaultProps) enyo.mixin(props, this.defaultProps, {ignore: true});
			props.kind = props.kind || props.isa || this.defaultKind;
			props.owner = props.owner || this;
		},
		
		/**
		* @private
		*/
		_createComponent: function (props, ext) {
			var def = ext ? enyo.mixin({}, [ext, props]) : enyo.clone(props);
			
			// always adjust the properties according to the needs of the kind and parent kinds
			this.adjustComponentProps(def);
			
			// pass along for the final stage
			return Component.create(def);
		},
		
		/**
		* Creates and returns a [component]{@link enyo.Component} as defined by the combination of 
		* a base and an additional property [hash]{@link external:Object}. The properties provided 
		* in the standard property [hash]{@link external:Object} override those provided in the 
		* additional property [hash]{@link external:Object}.
		* 
		* The created [component]{@link enyo.Component} passes through initialization machinery 
		* provided by the creating [component]{@link enyo.Component}, which may supply special 
		* handling. Unless the [owner]{@link enyo.Component#owner} is explicitly specified, the new 
		* [component]{@link enyo.Component} will be owned by the instance on which 
		* [createComponent]{@link enyo.Component#createComponent} is called.
		* 
		* @example
		* // Create a new component named _dynamic_ owned by _this_
		* // (will be available as this.$.dynamic).
		* this.createComponent({name: 'dynamic'});
		* 
		* @example
		* // Create a new component named _another_ owned by _other_
		* // (will be available as other.$.another).
		* this.createComponent({name: 'another'}, {owner: other});
		* 
		* @param {Object} props The declarative {@link external:kind} definition.
		* @param {Object} ext Additional properties to be applied (defaults).
		* @returns {enyo.Component} The instance created with the given parameters.
		* @public
		*/
		createComponent: function (props, ext) {
			// createComponent and createComponents both delegate to the protected method
			// (_createComponent), allowing overrides to customize createComponent and
			// createComponents separately.
			return this._createComponent(props, ext);
		},
		
		/**
		* Creates [components]{@link enyo.Component} as defined by the [arrays]{@link external:Array}
		* of base and additional property [hashes]{@link external:Object}. The standard and 
		* additional property [hashes]{@link external:Object} are combined as described in 
		* {@link enyo.Component#createComponent}.
		* 
		* @example
		* // ask foo to create components _bar_ and _zot_, but set the owner of
		* // both components to _this_.
		* this.$.foo.createComponents([
		*	{name: 'bar'},
		*	{name: 'zot'}
		* ], {owner: this});
		* 
		* @param {Object[]} props The array of {@link enyo.Component} definitions to be created.
		* @param {Object} ext Additional properties to be supplied as defaults for each.
		* @returns {enyo.Component[]} The array of [components]{@link enyo.Component} that were
		*	created.
		* @public
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
		* @private
		*/
		getBubbleTarget: function () {
			return this.bubbleTarget || this.owner;
		},
		
		/**
		* Bubbles an [event]{@link external:event} up an [object]{@link external:Object} chain, 
		* starting with _this_.
		*
		* A [handler]{@link enyo.Component~EventHandler} for an [event]{@link external:event} can be
		* specified. See {@link enyo.Component~EventHandler} for complete details.
		* 
		* @param {String} nom The name of the [event]{@link external:event} to bubble.
		* @param {Object} [event] The [event]{@link external:event} [object]{@link external:Object} 
		*	to be passed along while bubbling.
		* @param {enyo.Component} [sender=this] The {@link enyo.Component} responsible for
		*	bubbling the [event]{@link external:event}.
		* @returns {Boolean} `false` if unhandled or uninterrupted, `true` otherwise.
		* @public
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
		* Bubbles an [event]{@link external:event} up an [object]{@link external:Object} chain, 
		* starting __above__ _this_.
		* 
		* A [handler]{@link enyo.Component~EventHandler} for an [event]{@link external:event} can be
		* specified. See {@link enyo.Component~EventHandler} for complete details.
		* 
		* @param {String} nom The name of the [event]{@link external:event}.
		* @param {Object} [event] The [event]{@link external:event} properties to pass along while 
		*	bubbling.
		* @returns {Boolean} `false` if unhandled or uninterrupted, `true` otherwise.
		* @public
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
		* Sends an [event]{@link external:event} to a named [delegate]{@link external:delegate}. 
		* This [object]{@link external:Object} may dispatch an [event]{@link external:event{}} to 
		* itself via a [handler]{@link enyo.Component~EventHandler}, or to its 
		* [owner]{@link enyo.Component#owner} via an [event]{@link external:event} property, e.g.:
		* 
		*	handlers {
		*		// 'tap' events dispatched to this.tapHandler
		*		ontap: 'tapHandler'
		*	}
		* 
		*	// 'tap' events dispatched to 'tapHandler' delegate in this.owner
		*	ontap: 'tapHandler'
		* 
		* @private
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
		* Internal - try dispatching [event]{@link external:event} to self; if that fails, 
		* [bubble it up]{@link enyo.Component#bubbleUp} the tree.
		* 
		* @private
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
		* @private
		*/
		decorateEvent: function (nom, event, sender) {
			// an event may float by us as part of a dispatchEvent chain
			// both call this method so intermediaries can decorate inEvent
		},
		
		/**
		* @private
		*/
		stopAllJobs: function () {
			var job;
			
			if (this.__jobs) for (job in this.__jobs) this.stopJob(job);
		},
		
		/**
		* Dispatches the [event]{@link external:event} to named [delegate]{@link external:delegate} 
		* _nom_, if it exists. [Subkinds]{@link external:subkind} may re-route dispatches. Note that 
		* both 'handlers' [events]{@link external:event} and [events]{@link external:event} 
		* delegated from owned controls arrive here. If you need to handle these differently, you 
		* may also need to override [dispatchEvent]{@link enyo.Component#dispatchEvent}.
		* 
		* @param {String} nom The method name to dispatch the [event]{@link external:event}.
		* @param {Object} [event] The [event]{@link external:event} [object]{@link external:Object} 
		*	to pass along.
		* @param {enyo.Component} [sender=this] The originator of the [event]{@link external:event}.
		* @public
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
		* Triggers the [handler]{@link enyo.Component~EventHandler} for a given 
		* [event]{@link external:event} type.
		* 
		* @example
		* myControl.triggerHandler('ontap');
		* 
		* @param {String} nom The name of the [event]{@link external:event} to trigger.
		* @param {Object} [event] The [event]{@link external:event} object to pass along.
		* @param {enyo.Component} [sender=this] The originator of the [event]{@link external:event}.
		* @returns {Boolean} `false` if unhandled or uninterrupted, `true` otherwise.
		* @public
		*/
		triggerHandler: function () {
			return this.dispatchEvent.apply(this, arguments);
		},
		
		/**
		* Sends a message to myself and all of my [components]{@link enyo.Component}. You can stop a
		* _waterfall_ into [components]{@link enyo.Component} owned by a receiving 
		* [object]{@link external:Object} by returning a truthy value from the 
		* [event]{@link external:event} [handler]{@link enyo.Component~EventHandler}.
		* 
		* @param {String} nom The name of the [event]{@link external:event} to _waterfall_.
		* @param {Object} [event] The [event]{@link external:event} [object]{@link external:Object} 
		*	to pass along.
		* @param {enyo.Component} [sender=this] The originator of the [event]{@link external:event}.
		* @returns {this} The callee for chaining.
		* @public
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
		* Sends a message to all of my [components]{@link enyo.Component}, but not myself. You can 
		* stop a [waterfall]{@link enyo.Component#waterfall} into [components]{@link enyo.Component}
		* owned by a receiving [object]{@link external:Object} by returning a truthy value from the 
		* [event]{@link external:event} [handler]{@link enyo.Component~EventHandler}.
		* 
		* @param {String} nom The name of the [event]{@link external:event}.
		* @param {Object} [event] The [event]{@link external:event} [object]{@link external:Object} 
		*	to pass along.
		* @param {enyo.Component} [sender=this] The [event]{@link external:event} originator.
		* @returns {this} The callee for chaining.
		* @public
		*/
		waterfallDown: function(nom, event, sender) {
			var comp;
			
			if (!this._silenced) {
				for (comp in this.$) this.$[comp].waterfall(nom, event, sender || this);
			}
			
			return this;
		},
		
		/**
		* @private
		*/
		_silenced: false,
		
		/**
		* @private
		*/
		_silenceCount: 0,
		
		/**
		* Sets a flag that disables [event]{@link external:event} propagation for this 
		* [component]{@link enyo.Component}. Also increments an internal counter that tracks the 
		* number of times the [unsilence]{@link enyo.Component#unsilence} method must be called
		* before [event]{@link external:event} propagation will continue.
		* 
		* @returns {this} The callee for chaining.
		* @public
		*/
		silence: function () {
			this._silenced = true;
			this._silenceCount += 1;
			
			return this;
		},
		
		/**
		* Determines if the [object]{@link external:Object} is currently 
		* [silenced]{@link enyo.Component#_silenced}, which will prevent propagatation of
		* [events]{@link external:event} (of any kind).
		* 
		* @returns {Boolean} `true` if silenced, `false` otherwise.
		* @public
		*/
		isSilenced: function () {
			return this._silenced;
		},
		
		/**
		* Allows [event]{@link external:event} propagation for this [component]{@link enyo.Component} 
		* if the internal silence counter is `0`; otherwise, decrements the counter by one. For 
		* [event]{@link external:event} propagation to resume, this method must be called one time 
		* for each call to [silence]{@link enyo.Component#silence}.
		* 
		* @returns {Boolean} `true` if the {@link enyo.Component} is now unsilenced completely,
		*	`false` if it remains silenced.
		* @public
		*/
		unsilence: function () {
			if (0 !== this._silenceCount) --this._silenceCount;
			if (0 === this._silenceCount) this._silenced = false;
			return !this._silenced;
		},
		
		/**
		* Creates a new [job]{@link enyo.job} tied to this instance of the 
		* [component]{@link enyo.Component}. If the [component]{@link enyo.Component} is 
		* [destroyed]{@link enyo.Component#destroy}, any [jobs]{@link enyo.job} associated with it 
		* will be stopped.
		* 
		* If you start a [job]{@link enyo.job} with the same name as a pending [job]{@link enyo.job},
		* the original [job]{@link enyo.job} will be stopped; this can be useful for resetting 
		* timeouts.
		* 
		* You may supply a priority level (1-10) at which the [job]{@link enyo.job} should be 
		* executed. The default level is `5`. Setting the priority lower than `5` (or setting it to
		* the string `low`) will defer the [job]{@link enyo.job} if an animation is in progress, 
		* which can help to avoid stuttering.
		* 
		* @param {String} nom The name of the [job]{@link enyo.job} to start.
		* @param {(Function|String)} job Either the name of a method or a 
		*	[function]{@link external:Function} to execute as the 
		*	requested [job]{@link enyo.job}.
		* @param {Number} wait The number of milliseconds to wait before starting the 
		*	[job]{@link enyo.job}.
		* @param {Number} [priority=5] The priority value to be associated with this 
		*	[job]{@link enyo.job}.
		* @returns {this} The callee for chaining.
		* @public
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
		* Stops a [component]{@link enyo.Component}-specific [job]{@link enyo.job} before it has 
		* been activated.
		*
		* @param {String} nom The name of the [job]{@link enyo.job} to be stopped.
		* @returns {this} The callee for chaining.
		* @public
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
		* Execute the [job]{@link enyo.job} immediately, then prevent any other calls to 
		* _throttleJob_ with the same [job]{@link enyo.job} name from running for the specified
		* amount of time.
		* 
		* @param {String} nom The name of the [job]{@link enyo.job} to throttle.
		* @param {(Function|String)} job Either the name of a method or a 
		*	[function]{@link external:Function} to execute as the 
		*	requested [job]{@link enyo.job}.
		* @param {Number} wait The number of milliseconds to wait before executing the 
		*	[job]{@link enyo.job} again.
		* @returns {this} The callee for chaining.
		* @public
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
	* @private
	*/
	enyo.defaultCtor = Component;

	/**
	* Creates new instances from [config]{@link external:configurationBlock} 
	* [objects]{@link external:Object}. This method looks up the proper 
	* [constructor]{@link external:constructor} based on the provided [kind]{@link external:kind} 
	* attribute.
	* 
	* @name enyo.create
	* @param {Object} props The properties that define the [kind]{@link external:kind}.
	* @returns {*} An instance of the requested [kind]{@link external:kind}.
	* @public
	*/
	enyo.create = Component.create = function(props) {
		var kind,
			Ctor;
		
		if (!props.kind && props.hasOwnProperty('kind')) throw new Error(
			'enyo.create: Attempt to create a null kind. Check dependencies for [' + props.name + ']'
		);
		
		kind = props.kind || props.isa || enyo.defaultCtor;
		Ctor = enyo.constructorForKind(kind);
		
		if (!Ctor) {
			enyo.error('No constructor found for kind ' + kind);
			Ctor = Component;
		}
		
		return new Ctor(props);
	};

	/**
	* @name enyo.Component.subclass
	* @static
	* @private
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
	* @name enyo.Component.concat
	* @static
	* @private
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

	/**
	* @name enyo.Component.overrideComponents
	* @static
	* @private
	*/
	Component.overrideComponents = function(components, overrides, defaultKind) {
		var fn = function (k, v) { return !(enyo.isFunction(v) || enyo.isInherited(v)); };
		components = enyo.clone(components);
		for (var i=0; i<components.length; i++) {
			var c = enyo.clone(components[i]);
			var o = overrides[c.name];
			var ctor = enyo.constructorForKind(c.kind || defaultKind);
			if (o) {

				// NOTE: You cannot overload mixins, observers or computed properties from
				// component overrides
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
	* @name enyo.Component.publishEvents
	* @static
	* @private
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

	/**
	* @name enyo.Component.addEvent
	* @static
	* @private
	*/
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
	* @private
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
	}

})(enyo, this);