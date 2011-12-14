/**
	Manages a long list by rendering only small portions of the list at a time.
	Uses flyweight strategy via onSetupRow.
	We suggest users stick to the derived kind VirtualList instead.
	VirtualList introduces a paging strategy for backing data, but it can be 
	ignored if it's not needed.
*/
enyo.kind({
	name: "enyo.ScrollingList",
	kind: enyo.VFlexBox,
	events: {
		/** sent with arguments (inSender,inIndex) to ask owner to prepare the row with specificed index by 
			setting the properties of the objects in the list's components.  Return true if you should keep
			getting more onSetupRow events for more items. */
		onSetupRow: ""
	},
	rowsPerScrollerPage: 1,
	//* @protected
	controlParentName: "list",
	initComponents: function() {
		this.createComponents([
			{flex: 1, name: "scroller", kind: enyo.BufferedScroller, rowsPerPage: this.rowsPerScrollerPage, onGenerateRow: "generateRow", onAdjustTop: "adjustTop", onAdjustBottom: "adjustBottom", components: [
				{name: "list", kind: enyo.RowServer, onSetupRow: "setupRow"}
			]}
		]);
		this.inherited(arguments);
	},
	generateRow: function(inSender, inRow) {
		return this.$.list.generateRow(inRow);
	},
	setupRow: function(inSender, inRow) {
		return this.doSetupRow(inRow);
	},
	rendered: function() {
		this.inherited(arguments);
		// allow access to flyweight node after rendering or refreshing;
		// ensures, for example, that any dynamically added controls do not have 
		// a node access state out of sync with flyweight
		this.$.list.enableNodeAccess();
	},
	//* @public
	//* move the active index of the list to inIndex where it can be altered
	prepareRow: function(inIndex) {
		return this.$.list.prepareRow(inIndex);
	},
	//* indicate that a row has changed so the onSetupRow callback will be called for it
	updateRow: function(inIndex) {
		this.prepareRow(inIndex);
		this.setupRow(this, inIndex);
	},
	//* return the index of the active row
	fetchRowIndex: function() {
		return this.$.list.fetchRowIndex();
	},
	//* adjust rendering buffers to fit display
	update: function() {
		this.$.scroller.updatePages();
	},
	/** redraw any visible items in the list to reflect data changes without
		adjusting the list positition */
	refresh: function() {
		this.$.list.saveCurrentState();
		this.$.scroller.refreshPages();
		this.$.list.enableNodeAccess();
	},
	//* clear the list's internal state and refresh
	reset: function() {
		// dump state buffer
		this.$.list.clearState();
		// stop scroller animation
		this.$.scroller.$.scroll.stop();
		// dump and rebuild rendering buffers
		this.refresh();
	},
	//* completely reset the list so that it reloads all data and rerenders
	punt: function() {
		// dump state buffer
		this.$.list.clearState();
		// dump rendering buffers and locus data, rebuild from start state
		this.$.scroller.punt();
	}
});
