enyo.kind({
	name: "enyo.Container",
	kind: enyo.Containable,
	published: {
		controlParentName: "client",
		layoutKind: ""
	},
	create: function() {
		this.controls = [];
		this.children = [];
		this.inherited(arguments);
		this.layoutKindChanged();
	},
	destroy: function() {
		// destroys all non-chrome controls (regardless of owner)
		this.destroyClientControls();
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
	// controls
	//* @public
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
			// helpful for implementing controlParent in Panel.
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
		//inChild.parent = null;
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
			this.layout.flow(this);
		}
	},
	/*
	flowControls: function() {
		if (this.controlParent) {
			this.controlParent.flowControls();
		} else {
			this.flow();
		}
	},
	*/
	/**
		Send a message to me and all my controls
	*/
	// TODO: we probably need this functionality at the component level,
	// but the Component-owner tree is different but overlapping with respect
	// to the Control-parent tree.
	broadcastMessage: function(inMessageName, inArgs) {
		var fn = inMessageName + "Handler";
		if (this[fn]) {
			//this.log(this.name + ": ", inMessageName);
			return this[fn].apply(this, inArgs);
		}
		this.broadcastToControls(inMessageName, inArgs);
	},
	/**
		Call after this control has been resized to allow it to process the size change.
		To respond to a resize, override "resizeHandler" instead.
	*/
	// syntactic sugar for 'broadcastMessage("resize")'
	resized: function() {
		this.broadcastMessage("resize");
	},
	//* @protected
	resizeHandler: function() {
		this.broadcastToControls("resize");
	},
	/**
		Send a message to all my controls
	*/
	broadcastToControls: function(inMessageName, inArgs) {
		for (var i=0, cs=this.controls, c; c=cs[i]; i++) {
			c.broadcastMessage(inMessageName, inArgs);
		}
	}
});

enyo.createFromKind = function(inKind, inParam) {
	var ctor = inKind && enyo.constructorForKind(inKind);
	if (ctor) {
		return new ctor(inParam);
	}
};

//
// Default owner for ownerless Containers to allow notifying such Containers of important system events
// like window resize.
//
// NOTE: such Containers will not GC unless explicity destroyed as they will be referenced by this owner.
//
enyo.master = new enyo.Component();
