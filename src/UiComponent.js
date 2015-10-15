require('enyo');

/**
* Contains the declaration for the {@link module:enyo/UiComponent~UiComponent} kind.
* @module enyo/UiComponent
*/

var
	kind = require('./kind'),
	utils = require('./utils'),
	master = require('./master');

var
	Component = require('./Component');

/**
* {@link module:enyo/UiComponent~UiComponent} implements a container strategy suitable for presentation layers.
*
* `UiComponent` itself is abstract. Concrete [subkinds]{@glossary subkind} include
* {@link module:enyo/Control~Control} (for HTML/DOM) and
* {@link module:canvas/Control~Control} (for Canvas contexts).
*
* @class UiComponent
* @extends module:enyo/Component~Component
* @public
*/
var UiComponent = module.exports = kind(
	/** @lends module:enyo/UiComponent~UiComponent.prototype */ {

	name: 'enyo.UiComponent',

	/**
	* @private
	*/
	kind: Component,

	statics: {

		/**
		* The default set of keys which are effectively "ignored" when determining whether or not the
		* this control has changed in such a way that warrants a complete re-render. When
		* {@link enyo.UIComponent#updateComponents} is invoked on a parent component, this set of
		* stateful keys is utilized by default, if no stateful keys are provided by us.
		*
		* @type {String[]}
		* @default ['content', active', 'disabled']
		* @private
		*/
		statefulKeys: [
			'content',
			'active',
			'disabled'
		],

		/**
		* Finds static properties by walking up the inheritance chain, until the property is found.
		* By default this will return the property from {@link module:enyo/UiComponent} if the
		* property is not found anywhere along the chain.
		*
		* @param {module:enyo/kind} kind - The kind which we are attempting to retrieve the property
		*	from; if the property is not found on this kind, its parent kind will be examined.
		* @param {String} prop - The property we are trying to retrieve.
		* @returns {String[]} The array of stateful key strings.
		* @public
		*/
		findStatic: function (kind, prop) {
			if (kind) {
				if (kind[prop]) return kind[prop];
				return UiComponent.findStatic(kind.kind, prop);
			} else {
				return UiComponent[prop];
			}
		}
	},

	/**
	* @private
	*/
	published:
		/** @lends module:enyo/UiComponent~UiComponent.prototype */ {

		/**
		* The [UiComponent]{@link module:enyo/UiComponent~UiComponent} that physically contains this
		* [component]{@link module:enyo/Component~Component} in the DOM.
		*
		* @type {module:enyo/UiComponent~UiComponent}
		* @default null
		* @public
		*/
		container: null,

		/**
		* The [UiComponent]{@link module:enyo/UiComponent~UiComponent} that owns this
		* [component]{@link module:enyo/Component~Component} for purposes of {@glossary event}
		* propagation.
		*
		* @type {module:enyo/UiComponent~UiComponent}
		* @default null
		* @public
		*/
		parent: null,

		/**
		* The [UiComponent]{@link module:enyo/UiComponent~UiComponent} that will physically contain new items added
		* by calls to [createComponent()]{@link module:enyo/UiComponent~UiComponent#createComponent}.
		*
		* @type {String}
		* @default 'client'
		* @public
		*/
		controlParentName: 'client',

		/**
		* A {@glossary kind} used to manage the size and placement of child
		* [components]{@link module:enyo/Component~Component}.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		layoutKind: ''
	},

	/**
	* @private
	*/
	handlers: {
		onresize: 'handleResize'
	},

	/**
	* When set, provides a [control]{@link module:enyo/Control~Control} reference used to indicate where a
	* newly-created [component]{@link module:enyo/Component~Component} should be added in the
	* [UiComponent's]{@link module:enyo/UiComponent~UiComponent} [array]{@glossary Array} of children. This is
	* typically used when creating children dynamically (rather than at design time). If set
	* to `null`, the new control will be added at the beginning of the array; if set to a
	* specific existing control, the new control will be added before the specified
	* control. If left as `undefined`, the default behavior is to add the new control
	* at the end of the array.
	*
	* @type {module:enyo/Control~Control}
	* @default undefined
	* @public
	*/
	addBefore: undefined,

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			this.controls = this.controls || [];
			this.children = this.children || [];
			this.containerChanged();
			sup.apply(this, arguments);
			this.layoutKindChanged();
		};
	}),

	/**
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function() {
			// Destroys all non-chrome controls (regardless of owner).
			this.destroyClientControls();
			// Removes us from our container.
			this.setContainer(null);
			// Destroys chrome controls owned by this.
			sup.apply(this, arguments);
		};
	}),

	/**
	* @method
	* @private
	*/
	importProps: kind.inherit(function (sup) {
		return function(inProps) {
			sup.apply(this, arguments);
			if (!this.owner) {
				this.owner = master;
			}
		};
	}),

	/**
	* Creates [components]{@link module:enyo/Component~Component} as defined by the [arrays]{@glossary Array}
	* of base and additional property [hashes]{@glossary Object}. The standard and
	* additional property hashes are combined as described in
	* {@link module:enyo/Component~Component#createComponent}.
	*
	* ```
	* // ask foo to create components 'bar' and 'zot', but set the owner of
	* // both components to 'this'.
	* this.$.foo.createComponents([
	*	{name: 'bar'},
	*	{name: 'zot'}
	* ], {owner: this});
	* ```
	*
	* As implemented, [controlParentName]{@link module:enyo/UiComponent~UiComponent#controlParentName} only works
	* to identify an owned control created via `createComponents()`
	* (i.e., usually in our `components` block). To attach a `controlParent` via other means,
	* one must call [discoverControlParent()]{@link module:enyo/UiComponent~UiComponent#discoverControlParent} or
	* set `controlParent` directly.
	*
	* We could call `discoverControlParent()` in
	* [addComponent()]{@link module:enyo/Component~Component#addComponent}, but that would
	* cause a lot of useless checking.
	*
	* @param {Object[]} props The array of {@link module:enyo/Component~Component} definitions to be created.
	* @param {Object} ext - Additional properties to be supplied as defaults for each.
	* @returns {module:enyo/Component~Component[]} The array of components that were created.
	* @method
	* @public
	*/
	//
	createComponents: kind.inherit(function (sup) {
		return function() {
			var results = sup.apply(this, arguments);
			this.discoverControlParent();
			return results;
		};
	}),

		/**
	* An alternative component update path that attempts to intelligently update only the
	* relevant portions of the component which have changed.
	*
	* @param {Array} comps - An array of kind definitions to be set as the child components of
	*	this component.
	* @returns {Boolean} - Whether or not the component should be re-rendered.
	* @public
	*/
	updateComponents: function (comps) {
		var allStatefulKeys = {},
			isChanged = this.computeComponentsDiff(comps, allStatefulKeys),
			comp, controls, control, keys, key, idxKey, idxComp, kind;

		if (isChanged) {
			this.destroyClientControls();
			this.createComponents(comps);
			return true;
		} else {
			controls = this.getClientControls();
			for (idxComp = 0; idxComp < comps.length; idxComp++) {
				comp = comps[idxComp];
				control = controls[idxComp];
				kind = comp.kind || this.defaultKind;
				keys = allStatefulKeys[idxComp];

				for (idxKey = 0; idxKey < keys.length; idxKey++) { // for each key, determine if there is a change
					key = keys[idxKey];
					if (comp[key] != control[key]) {
						control.set(key, comp[key]);
					}
				}
			}
		}

		return false;
	},

	/**
	* @private
	*/
	computeComponentsDiff: function (comps, allStatefulKeys) {
		var hash = this.computeComponentsHash(comps, allStatefulKeys),
			isChanged = false;

		if (this._compHash) isChanged = this._compHash != hash;
		else isChanged = true;

		this._compHash = hash;

		return isChanged;
	},

	/**
	* @private
	*/
	computeComponentsHash: function (comps, allStatefulKeys) {
		var keyCount = 0,
			hash, str, filtered, chr, len, idx;

		// http://jsperf.com/json-parse-and-iteration-vs-array-map
		filtered = comps.map(this.bindSafely(function (comp, itemIdx) {
			var kind = comp.kind || this.defaultKind,
				keys = UiComponent.findStatic(kind, 'statefulKeys'),
				objKeys = Object.keys(comp),
				obj = {},
				idx, key, value;

			allStatefulKeys[itemIdx] = keys; // cache statefulKeys

			for (idx = 0; idx < objKeys.length; idx++) {
				key = objKeys[idx];

				if (keys.indexOf(key) == -1) { // ignore stateful keys
					value = comp[key];
					if (typeof value == 'function') value = (value.prototype && value.prototype.kindName) || value.toString();
					obj[key] = value;
					keyCount++;
				}

			}

			return obj;
		}));

		// Adapted from http://stackoverflow.com/a/7616484
		str = JSON.stringify(filtered) + keyCount;
		hash = 0;

		for (idx = 0, len = str.length; idx < len; idx++) {
			chr = str.charCodeAt(idx);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}

		return hash;
	},

	/**
	* Determines and sets the current [control's]{@link module:enyo/Control~Control} parent.
	*
	* @protected
	*/
	discoverControlParent: function () {
		this.controlParent = this.$[this.controlParentName] || this.controlParent;
	},

	/**
	* @method
	* @private
	*/
	adjustComponentProps: kind.inherit(function (sup) {
		return function(inProps) {
			// Components we create have us as a container by default.
			inProps.container = inProps.container || this;
			sup.apply(this, arguments);
		};
	}),

	/**
	* Containment
	*
	* @method
	* @private
	*/
	containerChanged: function (container) {
		if (container) {
			container.removeControl(this);
		}
		if (this.container) {
			this.container.addControl(this, this.addBefore);
		}
	},

	/**
	* Parentage
	*
	* @method
	* @private
	*/
	parentChanged: function (oldParent) {
		if (oldParent && oldParent != this.parent) {
			oldParent.removeChild(this);
		}
	},

	/**
	* Determines whether the [control]{@link module:enyo/Control~Control} is a descendant of
	* another control.
	*
	* Note: Oddly, a control is considered to be a descendant of itself.
	*
	* @method
	* @param {module:enyo/Control~Control} ancestor - The [control]{@link module:enyo/Control~Control} whose lineage
	*	will be checked to determine whether the current control is a descendant.
	* @public
	*/
	isDescendantOf: function (ancestor) {
		var p = this;
		while (p && p!=ancestor) {
			p = p.parent;
		}
		return ancestor && (p === ancestor);
	},

	/**
	* Returns all controls.
	*
	* @method
	* @returns {module:enyo/Control~Control[]} An [array]{@glossary Array} of [controls]{@link module:enyo/Control~Control}.
	* @public
	*/
	getControls: function () {
		return this.controls;
	},

	/**
	* Returns all non-chrome controls.
	*
	* @method
	* @returns {module:enyo/Control~Control[]} An [array]{@glossary Array} of [controls]{@link module:enyo/Control~Control}.
	* @public
	*/
	getClientControls: function () {
		var results = [];
		for (var i=0, cs=this.controls, c; (c=cs[i]); i++) {
			if (!c.isChrome) {
				results.push(c);
			}
		}
		return results;
	},

	/**
	* Destroys "client controls", the same set of [controls]{@link module:enyo/Control~Control} returned by
	* [getClientControls()]{@link module:enyo/UiComponent~UiComponent#getClientControls}.
	*
	* @method
	* @public
	*/
	destroyClientControls: function () {
		var c$ = this.getClientControls();
		for (var i=0, c; (c=c$[i]); i++) {
			c.destroy();
		}
	},

	/**
	* @method
	* @private
	*/
	addControl: function (ctl, before) {
		// Called to add an already created control to the object's control list. It is
		// not used to create controls and should likely not be called directly.
		// It can be overridden to detect when controls are added.
		if (before !== undefined) {
			var idx = (before === null) ? 0 : this.indexOfControl(before);
			this.controls.splice(idx, 0, ctl);
		} else {
			this.controls.push(ctl);
		}
		// When we add a Control, we also establish a parent.
		this.addChild(ctl, before);
	},

	/**
	* @method
	* @private
	*/
	removeControl: function (ctl) {
		// Called to remove a control from the object's control list. As with addControl it
		// can be overridden to detect when controls are removed.
		// When we remove a Control, we also remove it from its parent.
		ctl.setParent(null);
		return utils.remove(ctl, this.controls);
	},

	/**
	* @method
	* @private
	*/
	indexOfControl: function (ctl) {
		return utils.indexOf(ctl, this.controls);
	},

	/**
	* @method
	* @private
	*/
	indexOfClientControl: function (ctl) {
		return utils.indexOf(ctl, this.getClientControls());
	},

	/**
	* @method
	* @private
	*/
	indexInContainer: function () {
		return this.container.indexOfControl(this);
	},

	/**
	* @method
	* @private
	*/
	clientIndexInContainer: function () {
		return this.container.indexOfClientControl(this);
	},

	/**
	* @method
	* @private
	*/
	controlAtIndex: function (idx) {
		return this.controls[idx];
	},

	/**
	* Determines what the following sibling [control]{@link module:enyo/Control~Control} is for the current
	* [control]{@link module:enyo/Control~Control}.
	*
	* @method
	* @returns {module:enyo/Control~Control | null} The [control]{@link module:enyo/Control~Control} that is the] following
	*	sibling. If no following sibling exists, we return `null`.
	* @public
	*/
	getNextControl: function () {
		var comps = this.getParent().children,
			comp,
			sibling,
			i;

		for (i = comps.length - 1; i >= 0; i--) {
			comp = comps[i];
			if (comp === this) return sibling ? sibling : null;
			if (comp.generated) sibling = comp;
		}

		return null;
	},

	/**
	* Children
	*
	* @method
	* @private
	*/
	addChild: function (child, before) {
		// if before is undefined, add to the end of the child list.
		// If it's null, add to front of list, otherwise add before the
		// specified control.
		//
		// allow delegating the child to a different container
		if (this.controlParent /*&& !child.isChrome*/) {
			// this.controlParent might have a controlParent, and so on; seek the ultimate parent
			this.controlParent.addChild(child, before);
		} else {
			// NOTE: addChild drives setParent.
			// It's the opposite for setContainer, where containerChanged (in Containable)
			// drives addControl.
			// Because of the way 'parent' is derived from 'container', this difference is
			// helpful for implementing controlParent.
			// By the same token, since 'parent' is derived from 'container', setParent is
			// not intended to be called by client code. Therefore, the lack of parallelism
			// should be private to this implementation.
			// Set the child's parent property to this
			child.setParent(this);
			// track in children array
			if (before !== undefined) {
				var idx = (before === null) ? 0 : this.indexOfChild(before);
				this.children.splice(idx, 0, child);
			} else {
				this.children.push(child);
			}
		}
	},

	/**
	* @method
	* @private
	*/
	removeChild: function (child) {
		return utils.remove(child, this.children);
	},

	/**
	* @method
	* @private
	*/
	indexOfChild: function (child) {
		return utils.indexOf(child, this.children);
	},

	/**
	* @method
	* @private
	*/
	layoutKindChanged: function () {
		if (this.layout) {
			this.layout.destroy();
		}
		this.layout = kind.createFromKind(this.layoutKind, this);
		if (this.generated) {
			this.render();
		}
	},

	/**
	* @method
	* @private
	*/
	flow: function () {
		if (this.layout) {
			this.layout.flow();
		}
	},

	/**
	* CAVEAT: currently we use the entry point for both post-render layout work *and*
	* post-resize layout work.
	* @method
	* @private
	*/
	reflow: function () {
		if (this.layout) {
			this.layout.reflow();
		}
	},

	/**
	* Call after this [control]{@link module:enyo/Control~Control} has been resized to allow it to process the
	* size change. To respond to a resize, override `handleResize()` instead. Acts as syntactic
	* sugar for `waterfall('onresize')`.
	*
	* @method
	* @public
	*/
	resize: function () {
		this.waterfall('onresize');
		this.waterfall('onpostresize');
	},

	/**
	* @method
	* @private
	*/
	handleResize: function () {
		// FIXME: once we are in the business of reflowing layouts on resize, then we have an
		// inside/outside problem: some scenarios will need to reflow before child
		// controls reflow, and some will need to reflow after. Even more complex scenarios
		// have circular dependencies, and can require multiple passes or other resolution.
		// When we can rely on CSS to manage reflows we do not have these problems.
		this.reflow();
	},

	/**
	* Sends a message to all of my descendants, but not myself. You can stop a
	* [waterfall]{@link module:enyo/Component~Component#waterfall} into [components]{@link module:enyo/Component~Component}
	* owned by a receiving [object]{@glossary Object} by returning a truthy value from the
	* {@glossary event} [handler]{@link module:enyo/Component~Component~EventHandler}.
	*
	* @method
	* @param {String} nom - The name of the {@glossary event}.
	* @param {Object} [event] - The event object to pass along.
	* @param {module:enyo/Component~Component} [sender=this] - The event's originator.
	* @returns {this} The callee for chaining.
	* @public
	*/
	waterfallDown: function (nom, event, sender) {
		event = event || {};
		// Note: Controls will generally be both in a $ hash and a child list somewhere.
		// Attempt to avoid duplicated messages by sending only to components that are not
		// UiComponent, as those components are guaranteed not to be in a child list.
		// May cause a problem if there is a scenario where a UiComponent owns a pure
		// Component that in turn owns Controls.
		//
		// waterfall to all pure components
		for (var n in this.$) {
			if (!(this.$[n] instanceof UiComponent)) {
				this.$[n].waterfall(nom, event, sender);
			}
		}
		// waterfall to my children
		for (var i=0, cs=this.children, c; (c=cs[i]); i++) {
			c.waterfall(nom, event, sender);
		}
	},

	/**
	* @method
	* @private
	*/
	getBubbleTarget: function (nom, event) {
		if (event.delegate) return this.owner;
		else {
			return (
				this.bubbleTarget
				|| (this.cachedBubble && this.cachedBubbleTarget[nom])
				|| this.parent
				|| this.owner
			);
		}
	},
	
	/**
	* @method
	* @private
	*/
	bubbleTargetChanged: function (was) {
		if (was && this.cachedBubble && this.cachedBubbleTarget) {
			for (var n in this.cachedBubbleTarget) {
				if (this.cachedBubbleTarget[n] === was) delete this.cachedBubbleTarget[n];
			}
		}
	}
});
