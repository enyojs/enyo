//* @protected
enyo.kind({
	name: "enyo.RowServer",
	kind: enyo.Control,
	events: {
		onSetupRow: ""
	},
	components: [
		{name: "client", kind: "Flyweight", onNodeChange: "clientNodeChanged", onDecorateEvent: "clientDecorateEvent"},
		{name: "state", kind: "StateManager"}
	],
	lastIndex: null,
	//* @protected
	create: function() {
		this.inherited(arguments);
		// some layouts make important changes at render time, so we render
		// and discard one client copy so we are capturing as much default state
		// as possible
		this.$.client.generateHtml();
		this.validateControls();
	},
	//* @public
	validateControls: function() {
		this.$.state.setControl(this.$.client);
		this.$.state.clear();
	},
	prepareRow: function(inIndex) {
		//this.log(inIndex);
		this.transitionRow(inIndex);
		// if we cannot set controls to the row, it's unavailable
		// so we disableNodeAccess to it.
		var r = this.controlsToRow(inIndex);
		if (!r) {
			this.disableNodeAccess();
		}
		return r;
	},
	//* @protected
	// we don't render anything directly ourselves
	generateHtml: function() {
		return '';
	},
	// ...instead we generate copies of our flyweight on demand
	// FIXME: whenver a row is generated, we restore and save its state. 
	// This is potentially costly because state is restored/saved for all row children controls.
	// In addition a default state is synthesized for any rows without state.
	// IF this proves too costly (specifically restoring and synthesizing), we could impose
	// stricter limits on what can be in a row.
	// e.g. Without restoring state and using default state, the held property of an Item
	// can be incorrectly rendered true (i.e. when a list is scrolled and the mouse is kept down)
	generateRow: function(inIndex) {
		var r;
		// NOTE: when generating, must save current state because it is not guaranteed
		// to be saved before generating.
		// NOTE: set lastIndex to null since we are altering state index here (ensures we do not save 
		// a bad state during transitionRow)
		//this.log(inIndex);
		if (this.lastIndex != null) {
			this.saveCurrentState();
			this.lastIndex = null;
		}
		//
		if (!this._nodesDisabled) {
			this.disableNodeAccess();
		}
		this.$.state.restore(inIndex);
		// let owner configure the item
		var fr = this.formatRow(inIndex);
		if (fr !== undefined) {
			if (fr === null) {
				r = " ";
			} else if (fr) {
				// render the index key to DOM
				this.$.client.setAttribute("rowIndex", inIndex);
				// generate html
				r = this.generateChildHtml();
				// capture formatted state (Note: make sure this is after getting content
				// since getChildContent may affect state, e.g. via flow)
				this.$.state.save(inIndex);
			}
		}
		// NOTE: due to rendering we have switched state and therefore are our flyweight is 
		// out of sync: node points to old lastIndex and state points to inIndex.
		// we could switch back to lastIndex here (if we saved it above), but this would be too $.
		// Instead inform our flyweight that it should update on the next event
		// via needsNode flag.
		this.$.client.needsNode = true;
		//this.enableNodeAccess();
		return r;
	},
	// hook for subclassing
	formatRow: function(inIndex) {
		return this.doSetupRow(inIndex);
	},
	clearState: function() {
		this.lastIndex = null;
		this.$.state.clear();
		this.$.state.restore(0);
	},
	saveCurrentState: function() {
		if (this.lastIndex != null) {
			this.$.state.save(this.lastIndex);
		}
	},
	// for convenience decorate all events that go through flyweight with the list rowIndex
	clientDecorateEvent: function(inSender, inEvent) {
		inEvent.rowIndex = this.rowIndex;
	},
	// when our flyweight receives a new node via an event trigger, we must restore state for this row
	clientNodeChanged: function(inSender, inNode) {
		var i = this.fetchRowIndex();
		//this.log(i);
		this.transitionRow(i);
	},
	disableNodeAccess: function() {
		this.$.client.disableNodeAccess();
		this._nodesDisabled = true;
	},
	enableNodeAccess: function() {
		this.$.client.enableNodeAccess();
		this._nodesDisabled = false;
	},
	// save the state of the current row, restore state on new row
	transitionRow: function(inIndex) {
		//this.log(inIndex);
		this.rowIndex = inIndex;
		if (inIndex != this.lastIndex) {
			//this.log(inIndex);
			if (this.lastIndex != null) {
				this.$.state.save(this.lastIndex);
			}
			this.lastIndex = inIndex;
			this.$.state.restore(inIndex);
		}
		this.enableNodeAccess();
	},
	/**
		Update list's controls to act as if they are rendered in the given rowIndex.
		@param inRowIndex {Number} A row index for list's controls.
	*/
	controlsToRow: function(inRowIndex) {
		var n = this.fetchRowNode(inRowIndex);
		if (n) {
			//console.log("controls to row: " + inRowIndex, n.id);
			this.$.client.setNode(n);
			return true;
		}
	},
	/**
		Fetch the dom node for the given row index.
		@param inRowIndex {Number} A row index.
	*/
	fetchRowNode: function(inRowIndex) {
		var pn = this.getParentNode();
		if (pn) {
			// FIXME: we support nested lists, so need to find all matches with a given row index
			// and then get the one that matches our client id.
			// ... is there a selector that can combine finding an id and attribute? this doesn't work
			// return pn.querySelector('#' + this.$.client.id + ', [rowindex="' + inRowIndex + '"]');
			var matches = pn.querySelectorAll('[rowindex="' + inRowIndex + '"]');
			for (var i=0, m; m=matches[i]; i++) {
				if (m.id == this.$.client.id) {
					return m;
				}
			}
		}
	},
	/**
		Fetch the rowIndex which is currently receiving events.
		@returns {Number} a row index
	*/
	fetchRowIndex: function(inControl) {
		var c = inControl || this.$.client;
		// NOTE: typically this fires while node access is disabled so hasNode will fail,
		// however, it's a feature of flyweight that .node is set, so rely on it.
		var n = c.node;
		if (n) {
			return this.fetchRowIndexByNode(n);
		}
	},
	/**
		Fetch the rowIndex for a node in a list row.
		@param inNode {DomNode} A node in a list row.
		@returns {Number} The row index in which inNode exists.
	*/
	fetchRowIndexByNode: function(inNode) {
		var i, n = inNode, p = this.getParentNode();
		while (n && n.getAttribute && n != p) {
			i = n.getAttribute("rowIndex");
			if (i !== null) {
				return Number(i);
			}
			n = n.parentNode;
		}
	}
});