/**
	_enyo.UiComponent_ implements a container strategy suitable for presentation layers.

	UiComponent itself is abstract. Concrete subkinds include <a href="#enyo.Control">enyo.Control</a> (for HTML/DOM) and _enyo.CanvasControl_ for Canvas contexts.
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
		// destroys all non-chrome controls (regardless of owner)
		this.destroyClientControls();
		// remove us from our container
		this.setContainer(null);
		// destroys chrome controls owned by this
		this.inherited(arguments);
	},
	importProps: function(inProps) {
		this.inherited(arguments);
		if (!this.owner) {
			//this.log("registering ownerless control [" + this.kindName + "] with enyo.master");
			this.owner = enyo.master;
		}
	},
	// As implemented, controlParentName only works to identify an owned control created via createComponents 
	// (i.e. usually in our components block).
	// To attach a controlParent via other means, one needs to call discoverControlParent 
	// or set controlParent directly.
	// We could discoverControlParent in addComponent, but it would cause a lot of useless checking.
	createComponents: function() {
		this.inherited(arguments);
		this.discoverControlParent();
	},
	discoverControlParent: function() {
		this.controlParent = this.$[this.controlParentName] || this.controlParent;
	},
	// components we create have us as a container by default
	adjustComponentProps: function(inProps) {
		this.inherited(arguments);
		inProps.container = inProps.container || this;
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
	// Note: oddly, a Control is considered a descendant of itself
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
		Destroys 'client controls', the same set of controls returned by getClientControls.
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
		// when we add a Control, we also establish a parent
		this.addChild(inControl);
	},
	removeControl: function(inControl) {
		// when we remove a Control, we also remove it from it's parent
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
		To respond to a resize, override "resizeHandler" instead.
	*/
	// syntactic sugar for 'waterfall("onresize")'
	resized: function() {
		this.waterfall("onresize");
	},
	//* @protected
	resizeHandler: function() {
		// FIXME: once we are the business of reflowing layouts on resize, then we have a 
		// inside/outside problem: some scenarios will need to reflow before child
		// controls reflow, and some will need to reflow after. Even more complex scenarios
		// have circular dependencies, and can require multiple passes or other resolution.
		// When we can rely on CSS to manage reflows we do not have these problems.
		this.reflow();
	},
	/**
		Send a message to all my descendents
	*/
	waterfallDown: function(inMessage, inPayload, inSender) {
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
// Default owner for ownerless UiComponents to allow notifying such UiComponents of important system events
// like window resize.
//
// NOTE: ownerless UiComponents will not GC unless explicitly destroyed as they will be referenced by enyo.master.
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
			// resize is special, waterfall this message
			// this works because master is a Component, so it' waterfalls
			// to it's owned Components (i.e. master has no children)
			enyo.master.waterfallDown("onresize");
		} else {
			// all other top level events are sent only to interested Signal receivers
			enyo.Signals.send(inEventName, inEvent);
		}
	}
});
