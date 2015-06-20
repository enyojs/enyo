require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Component~Component} kind.
* @module enyo/Component
*/

var
	kind = require('./kind'),
	utils = require('./utils'),
	logger = require('./logger');

var
	CoreObject = require('./CoreObject'),
	ApplicationSupport = require('./ApplicationSupport'),
	ComponentBindingSupport = require('./ComponentBindingSupport'),
	Jobs = require('./jobs');

var
	kindPrefix = {},
	unnamedCounter = 0;
	
/**
* @callback module:enyo/Component~Component~EventHandler
* @param {module:enyo/Component~Component} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @param {Object} event - An [object]{@glossary Object} containing
*	event information.
* @returns {Boolean} A value indicating whether the event has been
*	handled or not. If `true`, then bubbling is stopped.
*/

/**
* A [hash]{@glossary Object} of references to all the [components]{@link module:enyo/Component~Component}
* owned by this component. This property is updated whenever a new
* component is added; the new component may be accessed via its
* [name]{@link module:enyo/Component~Component#name} property. We may also observe changes on
* properties of components referenced by the `$` property.
*
* Component access via the `$` hash:
* ```javascript
* var Component = require('enyo/Component');
* var c = new Component({
*	name: 'me',
*	components: [
*		{kind: 'Component', name: 'other'}
*	]
* });
*
* // We can now access 'other' on the $ hash of 'c', via c.$.other
* ```
*
* Observing changes on a component referenced by the `$` property:
* ```javascript
* var c = new Component({
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
* @memberof module:enyo/Component~Component.prototype
* @readonly
* @public
*/

/**
* If `true`, this [component's]{@link module:enyo/Component~Component} [owner]{@link module:enyo/Component~Component#owner} will
* have a direct name reference to the owned component.
*
* @example
* var Component = require('enyo/Component');
* var c = new Component({
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
* @memberOf module:enyo/Component~Component.prototype
* @public
*/

/**
* If `true`, the [layout]{@glossary layout} strategy will adjust the size of this
* [component]{@link module:enyo/Component~Component} to occupy the remaining available space.
*
* @name fit
* @type {Boolean}
* @default undefined
* @memberOf module:enyo/Component~Component.prototype
* @public
*/

/**
* {@link module:enyo/Component~Component} is the fundamental building block for Enyo applications.
* Components are designed to fit together, allowing complex behaviors to
* be fashioned from smaller bits of functionality.
*
* Component [constructors]{@glossary constructor} take a single
* argument (sometimes called a [component configuration]{@glossary configurationBlock}),
* a JavaScript [object]{@glossary Object} that defines various properties to be initialized on the
* component.  For example:
*
* ```javascript
* // create a new component, initialize its name property to 'me'
* var Component = require('enyo/Component');
* var c = new Component({
*	name: 'me'
* });
* ```
*
* When a component is instantiated, items configured in its
* `components` property are instantiated, too:
*
* ```javascript
* // create a new component, which itself has a component
* var c = new Component({
*	name: 'me',
*	components: [
*		{kind: Component, name: 'other'}
*	]
* });
* ```
*
* In this case, when `me` is created, `other` is also created, and we say that `me` owns `other`.
* In other words, the [owner]{@link module:enyo/Component~Component#owner} property of `other` equals `me`.
* Notice that you can specify the [kind]{@glossary kind} of `other` explicitly in its
* configuration block, to tell `me` what constructor to use to create `other`.
*
* To move a component, use the `setOwner()` method to change the
* component's owner. If you want a component to be unowned, use `setOwner(null)`.
*
* If you make changes to `Component`, be sure to add or update the appropriate
* {@linkplain https://github.com/enyojs/enyo/tree/master/tools/test/core/tests unit tests}.
*
* For more information, see the documentation on
* [Components]{@linkplain $dev-guide/key-concepts/components.html} in the
* Enyo Developer Guide.
*
* @class Component
* @extends module:enyo/CoreObject~Object
* @mixes module:enyo/ApplicationSupport~ApplicationSupport
* @mixes module:enyo/ComponentBindingSupport~ComponentBindingSupport
* @public
*/
var Component = module.exports = kind(
	/** @lends module:enyo/Component~Component.prototype */ {

	name: 'enyo.Component',

	/**
	* @private
	*/
	kind: CoreObject,

	/**
	* @private
	*/


	/**
	* @private
	*/
	cachedBubble: true,

	/**
	* @private
	*/
	cachePoint: false,

	/**
	* @private
	*/
	published:
		/** @lends module:enyo/Component~Component.prototype */ {

		/**
		* A unique name for the [component]{@link module:enyo/Component~Component} within its
		* [owner]{@link module:enyo/Component~Component#owner}. This is used to set the access name in the
		* owner's [$ hash]{@link module:enyo/Component~Component#$}. If not
		* specified, a default name will be provided based on the name of the
		* [object's]{@link module:enyo/CoreObject~Object} [kind]{@glossary kind}, with a numeric
		* suffix appended if more than one instance exists in the owner.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		name: '',

		/**
		* A unique id for the [component]{@link module:enyo/Component~Component}, usually automatically generated
		* based on its position within the component hierarchy, although
		* it may also be directly specified. {@link module:enyo/Control~Control} uses this `id` value for the
		* DOM [id]{@link module:enyo/Control~Control#id} attribute.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		id: '',

		/**
		* The [component]{@link module:enyo/Component~Component} that owns this component.
		* It is usually defined implicitly at creation time based on the
		* [createComponent()]{@link module:enyo/Component~Component#createComponent} call or
		* the `components` hash.
		*
		* @type {module:enyo/Component~Component}
		* @default null
		* @public
		*/
		owner: null,

		/**
		* This can be a [hash]{@glossary Object} of features to apply to
		* [chrome]{@glossary chrome} [components]{@link module:enyo/Component~Component} of the base
		* [kind]{@glossary kind}. They are matched by [name]{@link module:enyo/Component~Component#name}
		* (if the component you wish to modify does not have a name, this will not work).
		* You can modify any properties of the component except for methods. Setting a
		* value for `componentOverrides` at runtime will have no effect.
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
	constructor: kind.inherit(function (sup) {
		return function (props) {
			// initialize instance objects
			this._componentNameMap = {};
			this.$ = {};
			this.cachedBubbleTarget = {};
			sup.apply(this, arguments);
		};
	}),

	/**
	* @method
	* @private
	*/
	constructed: kind.inherit(function (sup) {
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
	* Removes this [component]{@link module:enyo/Component~Component} from its
	* [owner]{@link module:enyo/Component~Component#owner} (setting `owner` to `null`)
	* and does any necessary cleanup. The component is flagged with
	* `destroyed: true`. Usually, the component will be suitable for garbage
	* collection after being destroyed, unless user code keeps a reference
	* to it.
	*
	* @returns {this} The callee for chaining.
	* @method
	* @public
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			this.destroyComponents();
			this.setOwner(null);
			sup.apply(this, arguments);
			this.stopAllJobs();
			return this;
		};
	}),

	/**
	* Destroys all owned [components]{@link module:enyo/Component~Component}.
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
	* Adds a [component]{@link module:enyo/Component~Component} to the list of components
	* owned by the current component (i.e., [this.$]{@link module:enyo/Component~Component#$}).
	*
	* @param {module:enyo/Component~Component} comp - The [component]{@link module:enyo/Component~Component} to add.
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
	* Removes the passed-in [component]{@link module:enyo/Component~Component} from those known
	* to be owned by this component. The component will be removed from the
	* [$ hash]{@link module:enyo/Component~Component#$}, and from the [owner]{@link module:enyo/Component~Component#owner}
	* directly if [publish]{@link module:enyo/Component~Component#publish} is set to `true`.
	*
	* @param {module:enyo/Component~Component} comp - The component to remove.
	* @returns {this} The callee for chaining.
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
	* Returns an [array]{@glossary Array} of owned [components]{@link module:enyo/Component~Component}; in
	* other words, converts the [$ hash]{@link module:enyo/Component~Component#$} into an array
	* and returns the array.
	*
	* @returns {module:enyo/Component~Component[]} The [components]{@link module:enyo/Component~Component} found in the
	*	[$ hash]{@link module:enyo/Component~Component#$}.
	* @public
	*/
	getComponents: function () {
		return utils.values(this.$);
	},

	/**
	* @private
	*/
	adjustComponentProps: function (props) {
		if (this.defaultProps) utils.mixin(props, this.defaultProps, {ignore: true});
		props.kind = props.kind || props.isa || this.defaultKind;
		props.owner = props.owner || this;
	},

	/**
	* @private
	*/
	_createComponent: function (props, ext) {
		var def = ext ? utils.mixin({}, [ext, props]) : utils.clone(props);

		// always adjust the properties according to the needs of the kind and parent kinds
		this.adjustComponentProps(def);

		// pass along for the final stage
		return Component.create(def);
	},

	/**
	* Creates and returns a [component]{@link module:enyo/Component~Component} as defined by the combination of
	* a base and an additional property [hash]{@glossary Object}. The properties provided
	* in the standard property hash override those provided in the
	* additional property hash.
	*
	* The created component passes through initialization machinery
	* provided by the creating component, which may supply special
	* handling. Unless the [owner]{@link module:enyo/Component~Component#owner} is explicitly specified, the new
	* component will be owned by the instance on which this method is called.
	*
	* @example
	* // Create a new component named 'dynamic', owned by 'this'
	* // (will be available as this.$.dynamic).
	* this.createComponent({name: 'dynamic'});
	*
	* @example
	* // Create a new component named 'another' owned by 'other'
	* // (will be available as other.$.another).
	* this.createComponent({name: 'another'}, {owner: other});
	*
	* @param {Object} props - The declarative [kind]{@glossary kind} definition.
	* @param {Object} ext - Additional properties to be applied (defaults).
	* @returns {module:enyo/Component~Component} The instance created with the given parameters.
	* @public
	*/
	createComponent: function (props, ext) {
		// createComponent and createComponents both delegate to the protected method
		// (_createComponent), allowing overrides to customize createComponent and
		// createComponents separately.
		return this._createComponent(props, ext);
	},

	/**
	* Creates [components]{@link module:enyo/Component~Component} as defined by the [arrays]{@glossary Array}
	* of base and additional property [hashes]{@glossary Object}. The standard and
	* additional property hashes are combined as described in
	* [createComponent()]{@link module:enyo/Component~Component#createComponent}.
	*
	* @example
	* // ask foo to create components 'bar' and 'zot', but set the owner of
	* // both components to 'this'.
	* this.$.foo.createComponents([
	*	{name: 'bar'},
	*	{name: 'zot'}
	* ], {owner: this});
	*
	* @param {Object[]} props The array of {@link module:enyo/Component~Component} definitions to be created.
	* @param {Object} ext - Additional properties to be supplied as defaults for each.
	* @returns {module:enyo/Component~Component[]} The array of [components]{@link module:enyo/Component~Component} that were
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
	getBubbleTarget: function (nom, event) {
		if (event.delegate) return this.owner;
		else {
			return (
				this.bubbleTarget
				|| (this.cachedBubble && this.cachedBubbleTarget[nom])
				|| this.owner
			);
		}
	},

	/**
	* Bubbles an {@glossary event} up an [object]{@glossary Object} chain,
	* starting with `this`.
	*
	* A handler for an event may be specified. See {@link module:enyo/Component~Component~EventHandler}
	* for complete details.
	*
	* @param {String} nom - The name of the {@glossary event} to bubble.
	* @param {Object} [event] - The event [object]{@glossary Object} to be passed along
	* while bubbling.
	* @param {module:enyo/Component~Component} [sender=this] - The {@link module:enyo/Component~Component} responsible for
	*	bubbling the event.
	* @returns {Boolean} `false` if unhandled or uninterrupted; otherwise, `true`.
	* @public
	*/
	bubble: function (nom, event, sender) {
		if (!this._silenced) {
			event = event || {};
			event.lastHandledComponent = null;
			event.bubbling = true;
			// deliberately done this way
			if (event.originator == null) event.originator = sender || this;
			return this.dispatchBubble(nom, event, sender || this);
		}
		return false;
	},

	/**
	* Bubbles an {@glossary event} up an [object]{@glossary Object} chain,
	* starting **above** `this`.
	*
	* A handler for an event may be specified. See {@link module:enyo/Component~Component~EventHandler}
	* for complete details.
	*
	* @param {String} nom - The name of the {@glossary event}.
	* @param {Object} [event] - The event properties to pass along while bubbling.
	* @returns {Boolean} `false` if unhandled or uninterrupted; otherwise, `true`.
	* @public
	*/
	bubbleUp: function (nom, event) {
		var next;

		if (!this._silenced) {
			event = event || {};
			event.bubbling = true;
			next = this.getBubbleTarget(nom, event);
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
	* Sends an {@glossary event} to a named [delegate]{@glossary delegate}.
	* This [object]{@glossary Object} may dispatch an event to
	* itself via a [handler]{@link module:enyo/Component~Component~EventHandler}, or to its
	* [owner]{@link module:enyo/Component~Component#owner} via an event property, e.g.:
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
				var bHandler = this.handlers && this.handlers[nom];
				var bDelegatedFunction = this[nom] && utils.isString(this[nom]);
				var cachePoint = this.cachePoint || bHandler || bDelegatedFunction || this.id === "master" ;

				if (event.bubbling) {
					if (event.lastHandledComponent && cachePoint) {
						event.lastHandledComponent.cachedBubbleTarget[nom] = this;
						event.lastHandledComponent = null;
					}
					if (!event.lastHandledComponent && this.id !== "master") {
						event.lastHandledComponent = this;
					}
				}
				if (bHandler && this.dispatch(bHandler, event, sender)) {
					return true;
				}
				if (bDelegatedFunction) {
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
	* Internal - try dispatching {@glossary event} to self; if that fails,
	* [bubble it up]{@link module:enyo/Component~Component#bubbleUp} the tree.
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
	* Dispatches the {@glossary event} to named [delegate]{@glossary delegate} `nom`,
	* if it exists. [Subkinds]{@glossary subkind} may re-route dispatches. Note that
	* both 'handlers' events and events delegated from owned controls arrive here.
	* If you need to handle these types of events differently, you may also need to
	* override [dispatchEvent()]{@link module:enyo/Component~Component#dispatchEvent}.
	*
	* @param {String} nom - The method name to dispatch the {@glossary event}.
	* @param {Object} [event] - The event [object]{@glossary Object} to pass along.
	* @param {module:enyo/Component~Component} [sender=this] - The originator of the event.
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
	* Triggers the [handler]{@link module:enyo/Component~Component~EventHandler} for a given
	* {@glossary event} type.
	*
	* @example
	* myControl.triggerHandler('ontap');
	*
	* @param {String} nom - The name of the {@glossary event} to trigger.
	* @param {Object} [event] - The event object to pass along.
	* @param {module:enyo/Component~Component} [sender=this] - The originator of the event.
	* @returns {Boolean} `false` if unhandled or uninterrupted, `true` otherwise.
	* @public
	*/
	triggerHandler: function () {
		return this.dispatchEvent.apply(this, arguments);
	},

	/**
	* Sends a message to myself and all of my [components]{@link module:enyo/Component~Component}.
	* You can stop a waterfall into components owned by a receiving object
	* by returning a truthy value from the {@glossary event}
	* [handler]{@link module:enyo/Component~Component~EventHandler}.
	*
	* @param {String} nom - The name of the {@glossary event} to waterfall.
	* @param {Object} [event] - The event [object]{@glossary Object} to pass along.
	* @param {module:enyo/Component~Component} [sender=this] - The originator of the event.
	* @returns {this} The callee for chaining.
	* @public
	*/
	waterfall: function(nom, event, sender) {
		if (!this._silenced) {
			event = event || {};
			event.bubbling = false;

			// give the locals an opportunity to interrupt the event
			if (this.dispatchEvent(nom, event, sender)) return true;

			// otherwise carry on
			this.waterfallDown(nom, event, sender || this);
		}

		return this;
	},

	/**
	* Sends a message to all of my [components]{@link module:enyo/Component~Component}, but not myself. You can
	* stop a [waterfall]{@link module:enyo/Component~Component#waterfall} into [components]{@link module:enyo/Component~Component}
	* owned by a receiving [object]{@glossary Object} by returning a truthy value from the
	* {@glossary event} [handler]{@link module:enyo/Component~Component~EventHandler}.
	*
	* @param {String} nom - The name of the {@glossary event}.
	* @param {Object} [event] - The event [object]{@glossary Object} to pass along.
	* @param {module:enyo/Component~Component} [sender=this] - The event originator.
	* @returns {this} The callee for chaining.
	* @public
	*/
	waterfallDown: function(nom, event, sender) {
		var comp;
		event = event || {};
		event.bubbling = false;

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
	* Sets a flag that disables {@glossary event} propagation for this
	* [component]{@link module:enyo/Component~Component}. Also increments an internal counter that tracks
	* the number of times the [unsilence()]{@link module:enyo/Component~Component#unsilence} method must
	* be called before event propagation will continue.
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
	* Determines if the [object]{@glossary Object} is currently
	* [silenced]{@link module:enyo/Component~Component#_silenced}, which will prevent propagation of
	* [events]{@glossary event} (of any kind).
	*
	* @returns {Boolean} `true` if silenced; otherwise, `false`.
	* @public
	*/
	isSilenced: function () {
		return this._silenced;
	},

	/**
	* Allows {@glossary event} propagation for this [component]{@link module:enyo/Component~Component}
	* if the internal silence counter is `0`; otherwise, decrements the counter by one.
	* For event propagation to resume, this method must be called one time each call to
	* [silence()]{@link module:enyo/Component~Component#silence}.
	*
	* @returns {Boolean} `true` if the {@link module:enyo/Component~Component} is now unsilenced completely;
	*	`false` if it remains silenced.
	* @public
	*/
	unsilence: function () {
		if (0 !== this._silenceCount) --this._silenceCount;
		if (0 === this._silenceCount) this._silenced = false;
		return !this._silenced;
	},

	/**
	* Creates a new [job]{@link module:enyo/job} tied to this instance of the
	* [component]{@link module:enyo/Component~Component}. If the component is
	* [destroyed]{@link module:enyo/Component~Component#destroy}, any jobs associated with it
	* will be stopped.
	*
	* If you start a job with the same name as a pending job,
	* the original job will be stopped; this can be useful for resetting
	* timeouts.
	*
	* You may supply a priority level (1-10) at which the job should be
	* executed. The default level is `5`. Setting the priority lower than `5` (or setting it to
	* the string `"low"`) will defer the job if an animation is in progress,
	* which can help to avoid stuttering.
	*
	* @param {String} nom - The name of the [job]{@link module:enyo/job} to start.
	* @param {(Function|String)} job - Either the name of a method or a
	*	[function]{@glossary Function} to execute as the requested job.
	* @param {Number} wait - The number of milliseconds to wait before starting
	*	the job.
	* @param {Number} [priority=5] The priority value to be associated with this
	*	job.
	* @returns {this} The callee for chaining.
	* @public
	*/
	startJob: function (nom, job, wait, priority) {
		var jobs = (this.__jobs = this.__jobs || {});
		priority = priority || 5;
		// allow strings as job names, they map to local method names
		if (typeof job == 'string') job = this[job];
		// stop any existing jobs with same name
		this.stopJob(nom);
		jobs[nom] = setTimeout(this.bindSafely(function() {
			Jobs.add(this.bindSafely(job), priority, nom);
		}), wait);

		return this;
	},

	/**
	* Stops a [component]{@link module:enyo/Component~Component}-specific [job]{@link module:enyo/job} before it has
	* been activated.
	*
	* @param {String} nom - The name of the [job]{@link module:enyo/job} to be stopped.
	* @returns {this} The callee for chaining.
	* @public
	*/
	stopJob: function (nom) {
		var jobs = (this.__jobs = this.__jobs || {});
		if (jobs[nom]) {
			clearTimeout(jobs[nom]);
			delete jobs[nom];
		}
		Jobs.remove(nom);
	},

	/**
	* Executes the specified [job]{@link module:enyo/job} immediately, then prevents
	* any other calls to `throttleJob()` with the same job name from running for
	* the specified amount of time.
	*
	* @param {String} nom - The name of the [job]{@link module:enyo/job} to throttle.
	* @param {(Function|String)} job - Either the name of a method or a
	*	[function]{@glossary Function} to execute as the requested job.
	* @param {Number} wait - The number of milliseconds to wait before executing the
	*	job again.
	* @returns {this} The callee for chaining.
	* @public
	*/
	throttleJob: function (nom, job, wait) {
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

Component.prototype.defaultKind = Component;

/**
* @private
*/
kind.setDefaultCtor(Component);

/**
* Creates new instances from [config]{@glossary configurationBlock}
* [objects]{@glossary Object}. This method looks up the proper
* [constructor]{@glossary constructor} based on the provided [kind]{@glossary kind}
* attribute.
*
* @name module:enyo/Compoment~Component.create
* @param {Object} props - The properties that define the [kind]{@glossary kind}.
* @returns {*} An instance of the requested [kind]{@glossary kind}.
* @public
*/
Component.create = function (props) {
	var theKind,
		Ctor;

	if (!props.kind && props.hasOwnProperty('kind')) throw new Error(
		'enyo.create: Attempt to create a null kind. Check dependencies for [' + props.name + ']'
	);

	theKind = props.kind || props.isa || kind.getDefaultCtor();
	Ctor = kind.constructorForKind(theKind);

	if (!Ctor) {
		logger.error('No constructor found for kind ' + theKind);
		Ctor = Component;
	}

	return new Ctor(props);
};

/**
* @name module:enyo/Component~Component.subclass
* @static
* @private
*/
Component.subclass = function (ctor, props) {
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
* @name module:enyo/Component~Component.concat
* @static
* @private
*/
Component.concat = function (ctor, props) {
	var proto = ctor.prototype || ctor,
		handlers;
	if (props.handlers) {
		handlers = proto.handlers ? utils.clone(proto.handlers) : {};
		proto.handlers = utils.mixin(handlers, props.handlers);
		delete props.handlers;
	}
	if (props.events) Component.publishEvents(proto, props);
};

/**
* @name module:enyo/Component~Component.overrideComponents
* @static
* @private
*/
Component.overrideComponents = function (components, overrides, defaultKind) {
	var omitMethods = function (k, v) {
		var isMethod = 
			// If it's a function, then it's a method (unless it's
			// a constructor passed as value for 'kind')
			(utils.isFunction(v) && (k !== 'kind')) ||
			// If it isInherited(), then it's also a method (since
			// Inherited is an object wrapper for a function)
			kind.isInherited(v);

		return !isMethod;
	};
	components = utils.clone(components);
	for (var i=0; i<components.length; i++) {
		var c = utils.clone(components[i]);
		var o = overrides[c.name];
		var ctor = kind.constructorForKind(c.kind || defaultKind);
		if (o) {

			// NOTE: You cannot overload mixins, observers or computed properties from
			// component overrides
			kind.concatHandler(c, o);
			var b = (c.kind && ((typeof c.kind == 'string' && utils.getPath(c.kind)) || (typeof c.kind == 'function' && c.kind))) || kind.getDefaultCtor();
			while (b) {
				if (b.concat) { b.concat(c, o, true); }
				b = b.prototype.base;
			}
			// All others just mix in
			utils.mixin(c, o, {filter: omitMethods});
		}
		if (c.components) {
			c.components = Component.overrideComponents(c.components, overrides, ctor.prototype.defaultKind);
		}
		components[i] = c;
	}
	return components;
};

/**
* @name module:enyo/Component~Component.publishEvents
* @static
* @private
*/
Component.publishEvents = function (ctor, props) {
	var events = props.events,
		event,
		proto;
	if (events) {
		proto = ctor.prototype || ctor;
		for (event in events) Component.addEvent(event, events[event], proto);
	}
};

/**
* @name module:enyo/Component~Component.addEvent
* @static
* @private
*/
Component.addEvent = function (nom, val, proto) {
	var v, fn;
	if (!utils.isString(val)) {
		v = val.value;
		fn = val.caller;
	} else {
		if (nom.slice(0, 2) != 'on') {
			logger.warn('enyo/Component.addEvent: event names must start with "on". ' + proto.kindName + ' ' +
				'event "' + nom + '" was auto-corrected to "on' + nom + '".');
			nom = 'on' + nom;
		}
		v = val;
		fn = 'do' + utils.cap(nom.slice(2));
	}
	proto[nom] = v;
	if (!proto[fn]) {
		proto[fn] = function(payload, other) {
			// bubble this event

			// if the second parameter exists then we use that - this is for a single case
			// where a named event delegates happent to point to an auto generated event
			// bubbler like this one - in that case the first parameter is actually the
			// sender
			var e = other || payload;
			if (!e) {
				e = {};
			}
			var d = e.delegate;
			// delete payload.delegate;
			e.delegate = undefined;
			if (!utils.exists(e.type)) {
				e.type = nom;
			}
			this.bubble(nom, e);
			if (d) {
				e.delegate = d;
			}
		};
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
