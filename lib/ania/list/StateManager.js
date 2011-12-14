//* @protected
enyo.kind({
	name: "enyo.StateManager",
	kind: enyo.Component,
	published: {
		// control on which to track state
		control: null
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.state = [];
	},
	controlChanged: function() {
		this.clear();
		this.defaultState = null;
		this.makeDefaultState();
	},
	makeDefaultState: function() {
		var s = {};
		this.read(this.control, s);
		return s;
	},
	getDefaultState: function() {
		// make default state if it does not exist.
		if (!this.defaultState) {
			this.defaultState = this.makeDefaultState();
		}
		// synthesize a writeable state by copying the default state
		return this.copyState(this.defaultState);
	},
	//* @public
	clear: function() {
		this.state = [];
	},
	fetch: function(inIndex) {
		return this.state[inIndex] || (this.state[inIndex] = {});
	},
	save: function(inIndex) {
		//this.log(inIndex);
		this.read(this.control, this.fetch(inIndex));
	},
	restore: function(inIndex) {
		//this.log(inIndex);
		// if we have no state for this index, return the default state
		if (!this.state[inIndex]) {
			this.state[inIndex] = this.getDefaultState();
		}
		this.write(this.control, this.fetch(inIndex));
	},
	//* @protected
	read: function(inControl, inState) {
		this.readControl(inControl, inState);
		this.readChildren(inControl, inState);
	},
	readControl: function(inControl, inState) {
		var n;
		// FIXME: not grabbing published info from superclasses makes
		// the list of statified information a lot smaller but incomplete =(
		/*
		for (n in inControl.published) {
			inState[n] = inControl[n];
		}
		*/
		var props = inControl.getPublishedList();
		for (n in props) {
			inState[n] = inControl[n];
		}
		//
		// FIXME: Doh, we need to grab "statified" properties from super-kinds too
		// (used only in a couple places now; although one is SwipeableItem)
		for (n in inControl.statified) {
			inState[n] = inControl[n];
		}
		inState.domStyles = enyo.clone(inControl.domStyles);
		inState.attributes = enyo.clone(inControl.attributes);
		//
	},
	// lots of options for what sub-objects to read; let's go with children.
	// oops, causes a problem for popups, which we own but don't parent
	readChildren: function(inControl, inState) {
		var children = inState.children = inState.children || {};
		for (var i=0, c$=inControl.children, c, s; c=c$[i]; i++) {
			// NOTE: Allow controls to mark captureState false to avoid statifying (optimization)
			if (c.captureState !== false) {
				s = children[c.id] || (children[c.id] = {});
				this.read(c, s);
			}
		}
	},
	write: function(inControl, inState) {
		this.writeControl(inControl, inState);
		this.writeChildren(inControl, inState);
	},
	writeControl: function(inControl, inState) {
		for (var n in inState) {
			if (n != "children") {
				inControl[n] = inState[n];
			}
		}
	},
	writeChildren: function(inControl, inState) {
		var children = inState.children;
		for (var i=0, c$=inControl.children, c, s; c=c$[i]; i++) {
			s = children[c.id];
			if (s) {
				this.write(c, s);
			}
		}
	},
	copyState: function(inStateFrom) {
		var state = enyo.clone(inStateFrom);
		state.domStyles = enyo.clone(state.domStyles);
		state.attributes = enyo.clone(state.attributes);
		this.copyChildrenState(state, inStateFrom);
		return state;
	},
	copyChildrenState: function(inStateTo, inStateFrom) {
		inStateTo.children = {};
		var children = inStateFrom.children;
		for (var i in children) {
			inStateTo.children[i] = this.copyState(children[i]);
		}
	}
});