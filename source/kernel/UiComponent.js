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
		container: null,
		parent: null,
		controlParentName: "client",
		layoutKind: ""
	},
	handlers: {
		onresize: "resizeHandler"
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
		/*
		// the 'property master' is the object responsible for adjusting component props
		// which may not be the object on which component creation was invoked
		// the first-order property master is our container (this by default)
		var propMaster = inProps.container;
		// if we are the first-order property master, our control parent (if it exists) is the second-order master
		if (propMaster == this) {
			propMaster = this.controlParent || propMaster;
		}
		// if the property master is not us, delegate to him
		if (propMaster != this) {
			propMaster.adjustComponentProps(inProps);
		}
		// otherwise, do the usual
		else {
		*/
			this.inherited(arguments);
		//}
	},
	// containment
	containerChanged: function(inOldContainer) {
		if (inOldContainer) {
			inOldContainer.removeControl(this);
		}
		if (this.container) {
			this.container.addControl(this);
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
		for (var i=0, cs=this.controls, c; c=cs[i]; i++) {
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
		for (var i=0, c; c=c$[i]; i++) {
			c.destroy();
		}
	},
	//* @protected
	addControl: function(inControl) {
		this.controls.push(inControl);
		// When we add a Control, we also establish a parent.
		this.addChild(inControl);
	},
	removeControl: function(inControl) {
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
	addChild: function(inChild) {
		// allow delegating the child to a different container
		if (this.controlParent /*&& !inChild.isChrome*/) {
			// this.controlParent might have a controlParent, and so on; seek the ultimate parent
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
			this.children[this.prepend ? "unshift" : "push"](inChild);
			/*
			// FIXME: hacky, allows us to reparent a rendered control; we need better API for dynamic reparenting
			if (inChild.hasNode()) {
				inChild[this.prepend ? "_prepend" : "_append"]();
			}
			*/
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
		this.waterfall("onresize");
		this.waterfall("onpostresize");
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
		for (var i=0, cs=this.children, c; c=cs[i]; i++) {
			c.waterfall(inMessage, inPayload, inSender);
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
	getId: function() {
		return '';
	},
	isDescendantOf: enyo.nop,
	bubble: function(inEventName, inEvent, inSender) {
		//console.log("master event: " + inEventName);
		if (inEventName == "onresize") {
			// Resize is special; waterfall this message.
			// This works because master is a Component, so it waterfalls
			// to its owned Components (i.e., master has no children).
			enyo.master.waterfallDown("onresize");
			enyo.master.waterfallDown("onpostresize");
		} else {
			// All other top-level events are sent only to interested Signal
			// receivers.
			enyo.Signals.send(inEventName, inEvent);
		}
	}
});
