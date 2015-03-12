(function (enyo, scope) {
	/**
	* {@link enyo.UiComponent} implements a container strategy suitable for presentation layers.
	*
	* `UiComponent` itself is abstract. Concrete [subkinds]{@glossary subkind} include
	* {@link enyo.Control} (for HTML/DOM) and
	* {@link enyo.canvas.Control} (for Canvas contexts).
	*
	* @class enyo.UiComponent
	* @extends enyo.Component
	* @public
	*/
	enyo.kind(
		/** @lends enyo.UiComponent.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.UiComponent',

		/**
		* @private
		*/
		kind: 'enyo.Component',

		/**
		* @private
		*/
		published:
			/** @lends  enyo.UiComponent.prototype */ {

			/**
			* The [UiComponent]{@link enyo.UiComponent} that physically contains this
			* [component]{@link enyo.Component} in the DOM.
			*
			* @type {enyo.UiComponent}
			* @default null
			* @public
			*/
			container: null,

			/**
			* The [UiComponent]{@link enyo.UiComponent} that owns this
			* [component]{@link enyo.Component} for purposes of {@glossary event}
			* propagation.
			*
			* @type {enyo.UiComponent}
			* @default null
			* @public
			*/
			parent: null,

			/**
			* The [UiComponent]{@link enyo.UiComponent} that will physically contain new items added
			* by calls to [createComponent()]{@link enyo.UiComponent#createComponent}.
			*
			* @type {String}
			* @default 'client'
			* @public
			*/
			controlParentName: 'client',

			/**
			* A [kind]{@glossary kind} used to manage the size and placement of child
			* [components]{@link enyo.Component}.
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
		* When set, provides a [control]{@link enyo.Control} reference used to indicate where a
		* newly-created [component]{@link enyo.Component} should be added in the
		* [UiComponent's]{@link enyo.UiComponent} [array]{@glossary Array} of children. This is
		* typically used when creating children dynamically (rather than at design time). If set
		* to `null`, the new control will be added at the beginning of the array; if set to a
		* specific existing control, the new control will be added before the specified
		* control. If left as `undefined`, the default behavior is to add the new control
		* at the end of the array.
		*
		* @type {enyo.Control}
		* @default undefined
		* @public
		*/
		addBefore: undefined,

		/**
		* @private
		*/
		protectedStatics: {
			_resizeFlags: {showingOnly: true} // don't waterfall these events into hidden controls
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
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
		destroy: enyo.inherit(function (sup) {
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
		importProps: enyo.inherit(function (sup) {
			return function(inProps) {
				sup.apply(this, arguments);
				if (!this.owner) {
					this.owner = enyo.master;
				}
			};
		}),

		/**
		* Creates [components]{@link enyo.Component} as defined by the [arrays]{@glossary Array}
		* of base and additional property [hashes]{@glossary Object}. The standard and
		* additional property hashes are combined as described in
		* {@link enyo.Component#createComponent}.
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
		* As implemented, [controlParentName]{@link enyo.UiComponent#controlParentName} only works
		* to identify an owned control created via `createComponents()`
		* (i.e., usually in our `components` block). To attach a `controlParent` via other means,
		* one must call [discoverControlParent()]{@link enyo.UiComponent#discoverControlParent} or
		* set `controlParent` directly.
		*
		* We could call `discoverControlParent()` in
		* [addComponent()]{@link enyo.Component#addComponent}, but that would
		* cause a lot of useless checking.
		*
		* @param {Object[]} props The array of {@link enyo.Component} definitions to be created.
		* @param {Object} ext - Additional properties to be supplied as defaults for each.
		* @returns {enyo.Component[]} The array of components that were created.
		* @method
		* @public
		*/
		//
		createComponents: enyo.inherit(function (sup) {
			return function() {
				var results = sup.apply(this, arguments);
				this.discoverControlParent();
				return results;
			};
		}),

		/**
		* Determines and sets the current [control's]{@link enyo.Control} parent.
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
		adjustComponentProps: enyo.inherit(function (sup) {
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
		* Determines whether the [control]{@link enyo.Control} is a descendant of
		* another control.
		*
		* Note: Oddly, a control is considered to be a descendant of itself.
		*
		* @param {enyo.Control} ancestor - The [control]{@link enyo.Control} whose lineage
		*	will be checked to determine whether the current control is a descendant.
		* @public
		*/
		isDescendantOf: function (ancestor) {
			var p = this;
			while (p && p!=ancestor) {
				p = p.parent;
			}
			return ancestor && (p == ancestor);
		},

		/**
		* Returns all controls.
		*
		* @returns {enyo.Control[]} An [array]{@glossary Array} of [controls]{@link enyo.Control}.
		* @public
		*/
		getControls: function () {
			return this.controls;
		},

		/**
		* Returns all non-chrome controls.
		*
		* @returns {enyo.Control[]} An [array]{@glossary Array} of [controls]{@link enyo.Control}.
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
		* Destroys "client controls", the same set of [controls]{@link enyo.Control} returned by
		* [getClientControls()]{@link enyo.UiComponent#getClientControls}.
		*
		* @public
		*/
		destroyClientControls: function () {
			var c$ = this.getClientControls();
			for (var i=0, c; (c=c$[i]); i++) {
				c.destroy();
			}
		},

		/**
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
		* @private
		*/
		removeControl: function (ctl) {
			// Called to remove a control from the object's control list. As with addControl it
			// can be overridden to detect when controls are removed.
			// When we remove a Control, we also remove it from its parent.
			ctl.setParent(null);
			return enyo.remove(ctl, this.controls);
		},

		/**
		* @private
		*/
		indexOfControl: function (ctl) {
			return enyo.indexOf(ctl, this.controls);
		},

		/**
		* @private
		*/
		indexOfClientControl: function (ctl) {
			return enyo.indexOf(ctl, this.getClientControls());
		},

		/**
		* @private
		*/
		indexInContainer: function () {
			return this.container.indexOfControl(this);
		},

		/**
		* @private
		*/
		clientIndexInContainer: function () {
			return this.container.indexOfClientControl(this);
		},

		/**
		* @private
		*/
		controlAtIndex: function (idx) {
			return this.controls[idx];
		},

		/**
		* Determines what the following sibling [control]{@link enyo.Control} is for the current
		* [control]{@link enyo.Control}.
		*
		* @returns {enyo.Control | null} The [control]{@link enyo.Control} that is the] following
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
		* @private
		*/
		removeChild: function (child) {
			return enyo.remove(child, this.children);
		},

		/**
		* @private
		*/
		indexOfChild: function (child) {
			return enyo.indexOf(child, this.children);
		},

		/**
		* @private
		*/
		layoutKindChanged: function () {
			if (this.layout) {
				this.layout.destroy();
			}
			this.layout = enyo.createFromKind(this.layoutKind, this);
			if (this.generated) {
				this.render();
			}
		},

		/**
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
		* @private
		*/
		reflow: function () {
			if (this.layout) {
				this.layout.reflow();
			}
		},

		/**
		* Call after this [control]{@link enyo.Control} has been resized to allow it to process the
		* size change. To respond to a resize, override `handleResize()` instead. Acts as syntactic
		* sugar for `waterfall('onresize')`.
		*
		* @public
		*/
		resize: function () {
			this.waterfall('onresize', enyo.UiComponent._resizeFlags);
			this.waterfall('onpostresize', enyo.UiComponent._resizeFlags);
		},

		/**
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
		* [waterfall]{@link enyo.Component#waterfall} into [components]{@link enyo.Component}
		* owned by a receiving [object]{@glossary Object} by returning a truthy value from the
		* {@glossary event} [handler]{@link enyo.Component~EventHandler}.
		*
		* @param {String} nom - The name of the {@glossary event}.
		* @param {Object} [event] - The event object to pass along.
		* @param {enyo.Component} [sender=this] - The event's originator.
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
				if (!(this.$[n] instanceof enyo.UiComponent)) {
					this.$[n].waterfall(nom, event, sender);
				}
			}
			// waterfall to my children
			for (var i=0, cs=this.children, c; (c=cs[i]); i++) {
				// Do not send {showingOnly: true} events to hidden controls. This flag is set for resize events
				// which are broadcast from within the framework. This saves a *lot* of unnecessary layout.
				// TODO: Maybe remember that we did this, and re-send those messages on setShowing(true)?
				// No obvious problems with it as-is, though
				if (c.showing || !(event && event.showingOnly)) {
					c.waterfall(nom, event, sender);
				}
			}
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
					|| this.parent
					|| this.owner
				);
			}
		}
	});

	/**
	* @private
	*/
	enyo.createFromKind = function (kind, param) {
		var Ctor = kind && enyo.constructorForKind(kind);
		if (Ctor) {
			return new Ctor(param);
		}
	};

	/**
	* Default owner assigned to ownerless [UiComponents]{@link enyo.UiComponent},
	* to allow such UiComponents to be notified of important system events like window resize.
	*
	* NOTE: Ownerless [UiComponents]{@link enyo.UiComponent} will not be garbage collected unless
	* explicitly destroyed, as they will be referenced by `enyo.master`.
	*
	* @private
	*/
	enyo.master = new enyo.Component({
		name: 'master',
		notInstanceOwner: true,
		eventFlags: {showingOnly: true}, // don't waterfall these events into hidden controls
		getId: function () {
			return '';
		},
		isDescendantOf: enyo.nop,
		bubble: function (nom, event) {
			//enyo.log('master event: ' + nom);
			if (nom == 'onresize') {
				// Resize is special; waterfall this message.
				// This works because master is a Component, so it waterfalls
				// to its owned Components (i.e., master has no children).
				enyo.master.waterfallDown('onresize', this.eventFlags);
				enyo.master.waterfallDown('onpostresize', this.eventFlags);

				// If the window is resized, we'll want to update the scale factor.
				enyo.dom.updateScaleFactor();
			} else {
				// All other top-level events are sent only to interested Signal
				// receivers.
				enyo.Signals.send(nom, event);
			}
		}
	});

})(enyo, this);