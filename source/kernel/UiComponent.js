/**
	_enyo.UiComponent_ implements a container strategy suitable for presentation
	layers.

	UiComponent itself is abstract.  Concrete subkinds include
	<a href="#enyo.Control">enyo.Control</a> (for HTML/DOM) and
	<a href="#enyo.canvas.Control">enyo.canvas.Control</a>
	(for Canvas contexts).
*/
enyo.kind({
	name: "enyo.UiComponent",
	kind: enyo.Component,
	published: {
		//* The UiComponent that physically contains this component in the DOM
		container: null,
		/**
			The UiComponent that owns this component for purposes of event
			propagation
		*/
		parent: null,
		/**
			The UiComponent that will physically contain new items added by
			calls to _createComponent_
		*/
		controlParentName: "client",
		//* A kind used to manage the size and placement of child components
		layoutKind: ""
	},
	handlers: {
		onresize: "resizeHandler"
	},
	/**
		When set, provides a control reference used to indicate where a
		newly-created component should be added in the UiComponent's array of
		children. This is typically used when dynamically creating children
		(rather than at design time). If set to null, the new control will be
		added at the beginning of the array; if set to a specific existing
		control, the new control will be added before the specified control. If
		left undefined, the	default behavior is to add the new control at the
		end of the array.
	*/
	addBefore: undefined,
	//* @protected
	statics: {
		_resizeFlags: {showingOnly: true} // don't waterfall these events into hidden controls
	},
	create: function() {
		this.controls = [];
		this.children = [];
		this.containerChanged();
		this.inherited(arguments);
		this.layoutKindChanged();
	},
	destroy: function() {
		// Destroys all non-chrome controls (regardless of owner).
		this.destroyClientControls();
		// Removes us from our container.
		this.setContainer(null);
		// Destroys chrome controls owned by this.
		this.inherited(arguments);
	},
	importProps: function(inProps) {
		this.inherited(arguments);
		if (!this.owner) {
			//this.log("registering ownerless control [" + this.kindName + "] with enyo.master");
			this.owner = enyo.master;
		}
	},
	// As implemented, _controlParentName_ only works to identify an owned
	// control created via _createComponents_ (i.e., usually in our _components_
	// block).  To attach a _controlParent_ via other means, one must call
	// _discoverControlParent_ or set _controlParent_ directly.
	//
	// We could call _discoverControlParent_ in _addComponent_, but it would
	// cause a lot of useless checking.
	createComponents: function() {
		var results = this.inherited(arguments);
		this.discoverControlParent();
		return results;
	},
	discoverControlParent: function() {
		this.controlParent = this.$[this.controlParentName] || this.controlParent;
	},
	adjustComponentProps: function(inProps) {
		// Components we create have us as a container by default.
		inProps.container = inProps.container || this;
		this.inherited(arguments);
	},
	// containment
	containerChanged: function(inOldContainer) {
		if (inOldContainer) {
			inOldContainer.removeControl(this);
		}
		if (this.container) {
			this.container.addControl(this, this.addBefore);
		}
	},
	// parentage
	parentChanged: function(inOldParent) {
		if (inOldParent && inOldParent != this.parent) {
			inOldParent.removeChild(this);
		}
	},
	//* @public
	// Note: Oddly, a Control is considered a descendant of itself.
	isDescendantOf: function(inAncestor) {
		var p = this;
		while (p && p!=inAncestor) {
			p = p.parent;
		}
		return inAncestor && (p == inAncestor);
	},
	/**
		Returns all controls.
	*/
	getControls: function() {
		return this.controls;
	},
	/**
		Returns all non-chrome controls.
	*/
	getClientControls: function() {
		var results = [];
		for (var i=0, cs=this.controls, c; (c=cs[i]); i++) {
			if (!c.isChrome) {
				results.push(c);
			}
		}
		return results;
	},
	/**
		Destroys "client controls", the same set of controls returned by
		_getClientControls_.
	*/
	destroyClientControls: function() {
		var c$ = this.getClientControls();
		for (var i=0, c; (c=c$[i]); i++) {
			c.destroy();
		}
	},
	//* @protected
	addControl: function(inControl, inBefore) {
		// Called to add an already created control to the object's control list. It is
		// not used to create controls and should likely not be called directly.
		// It can be overridden to detect when controls are added.
		this.controls.push(inControl);
		// When we add a Control, we also establish a parent.
		this.addChild(inControl, inBefore);
	},
    removeControl: function(inControl) {
		// Called to remove a control from the object's control list. As with addControl it
		// can be overridden to detect when controls are removed.
		// When we remove a Control, we also remove it from its parent.
		inControl.setParent(null);
		return enyo.remove(inControl, this.controls);
	},
	indexOfControl: function(inControl) {
		return enyo.indexOf(inControl, this.controls);
	},
	indexOfClientControl: function(inControl) {
		return enyo.indexOf(inControl, this.getClientControls());
	},
	indexInContainer: function() {
		return this.container.indexOfControl(this);
	},
	clientIndexInContainer: function() {
		return this.container.indexOfClientControl(this);
	},
	controlAtIndex: function(inIndex) {
		return this.controls[inIndex];
	},
	// children
	addChild: function(inChild, inBefore) {
		// if inBefore is undefined, add to the end of the child list.
		// If it's null, add to front of list, otherwise add before the
		// specified control.
		//
		// allow delegating the child to a different container
		if (this.controlParent /*&& !inChild.isChrome*/) {
			// this.controlParent might have a controlParent, and so on; seek the ultimate parent
			// inBefore is not passed because that control won't be in the controlParent's scope
			this.controlParent.addChild(inChild);
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
			inChild.setParent(this);
			// track in children array
			if (inBefore !== undefined) {
				var idx = (inBefore === null) ? 0 : this.indexOfChild(inBefore);
				this.children.splice(idx, 0, inChild);
			} else {
				this.children.push(inChild);
			}
		}
	},
	removeChild: function(inChild) {
		return enyo.remove(inChild, this.children);
	},
	indexOfChild: function(inChild) {
		return enyo.indexOf(inChild, this.children);
	},
	layoutKindChanged: function() {
		if (this.layout) {
			this.layout.destroy();
		}
		this.layout = enyo.createFromKind(this.layoutKind, this);
		if (this.generated) {
			this.render();
		}
	},
	flow: function() {
		if (this.layout) {
			this.layout.flow();
		}
	},
	// CAVEAT: currently we use the entry point for both
	// post-render layout work *and* post-resize layout work.
	reflow: function() {
		if (this.layout) {
			this.layout.reflow();
		}
	},
	/**
		Call after this control has been resized to allow it to process the size change.
		To respond to a resize, override _resizeHandler_ instead.
	*/
	// syntactic sugar for 'waterfall("onresize")'
	resized: function() {
		this.waterfall("onresize", enyo.UiComponent._resizeFlags);
		this.waterfall("onpostresize", enyo.UiComponent._resizeFlags);
	},
	//* @protected
	resizeHandler: function() {
		// FIXME: once we are in the business of reflowing layouts on resize, then we have an 
		// inside/outside problem: some scenarios will need to reflow before child
		// controls reflow, and some will need to reflow after. Even more complex scenarios
		// have circular dependencies, and can require multiple passes or other resolution.
		// When we can rely on CSS to manage reflows we do not have these problems.
		this.reflow();
	},
	/**
		Sends a message to all my descendents.
	*/
	waterfallDown: function(inMessage, inPayload, inSender) {
		// Note: Controls will generally be both in a $ hash and a child list somewhere.
		// Attempt to avoid duplicated messages by sending only to components that are not
		// UiComponent, as those components are guaranteed not to be in a child list.
		// May cause a problem if there is a scenario where a UiComponent owns a pure 
		// Component that in turn owns Controls.
		//
		// waterfall to all pure components
		for (var n in this.$) {
			if (!(this.$[n] instanceof enyo.UiComponent)) {
				this.$[n].waterfall(inMessage, inPayload, inSender);
			}
		}
		// waterfall to my children
		for (var i=0, cs=this.children, c; (c=cs[i]); i++) {
			// Do not send {showingOnly: true} events to hidden controls. This flag is set for resize events 
			// which are broadcast from within the framework. This saves a *lot* of unnecessary layout.
			// TODO: Maybe remember that we did this, and re-send those messages on setShowing(true)? 
			// No obvious problems with it as-is, though
			if (c.showing || !(inPayload && inPayload.showingOnly)) {
				c.waterfall(inMessage, inPayload, inSender);
			}
		}
	},
	getBubbleTarget: function() {
		return this.parent;
	}
});

enyo.createFromKind = function(inKind, inParam) {
	var ctor = inKind && enyo.constructorForKind(inKind);
	if (ctor) {
		return new ctor(inParam);
	}
};

//
// Default owner for ownerless UiComponents to allow notifying such UiComponents
// of important system events like window resize.
//
// NOTE: Ownerless UiComponents will not be garbage collected unless explicitly
// destroyed, as they will be referenced by _enyo.master_.
//
enyo.master = new enyo.Component({
	name: "master",
	notInstanceOwner: true,
	eventFlags: {showingOnly: true}, // don't waterfall these events into hidden controls
	getId: function() {
		return '';
	},
	isDescendantOf: enyo.nop,
	bubble: function(inEventName, inEvent, inSender) {
		//enyo.log("master event: " + inEventName);
		if (inEventName == "onresize") {
			// Resize is special; waterfall this message.
			// This works because master is a Component, so it waterfalls
			// to its owned Components (i.e., master has no children).
			enyo.master.waterfallDown("onresize", this.eventFlags);
			enyo.master.waterfallDown("onpostresize", this.eventFlags);
		} else {
			// All other top-level events are sent only to interested Signal
			// receivers.
			enyo.Signals.send(inEventName, inEvent);
		}
	}
});
