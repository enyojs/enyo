/**
A control that displays a scrolling list of rows. It is suitable for displaying very large
lists. VirtualList is optimized such that only a small portion of the list is rendered
at a given time. A <a href="#enyo.Flyweight">flyweight</a> strategy is employed to render one set of list row
controls as needed for as many rows as are contained in the list.

Note: Because a VirtualList contains a <a href="#enyo.Scroller">Scroller</a>, it must have a fixed size. If a
list with variable height is required, use an <a href="#enyo.VirtualRepeater">enyo.VirtualRepeater</a>.

##Basic Use

A VirtualList's components block contains the controls to be used for a single row.
This set of controls will be rendered for each row.

The onSetupRow event allows for customization of row rendering. Here's a simple example:

	components: [
		{kind: "VirtualList", onSetupRow: "setupRow", components: [
			{kind: "Item", layoutKind: "HFlexLayout", components: [
				{name: "content", flex: 1},
				{kind: "Button", onclick: "buttonClick"}
			]}
		]}
	],
	setupRow: function(inSender, inIndex) {
		if (inIndex < 100) {
			this.$.content.setContent("I am item: " + inIndex);
			this.$.button.setContent("Button" + inIndex);
			return true;
		}
	}

In the above example, the control named "item" will be rendered for each row. When a row is rendered, 
the onSetupRow event is fired with the row index.
The setupRow method sets properties on controls in the row to customize the rendering of the row.
Notice that it returns true if the index is less than 100. An onSetupRow handler must 
return true to indicate that the given row should be rendered. If it does not, the list 
will stop rendering.

Continuing with the above example, we have given the button an onclick handler. As previously noted, the button
is rendered for each of the 100 list rows. The onclick handler will fire for a click on any of the row
buttons. It is common to need to know the exact row on which a user clicked. Events fired from within list rows
contain this information in the _rowIndex_ property of the DOM event object.
For example:

	buttonClick: function(inSender, inEvent) {
		this.log("The user clicked on item number: " + inEvent.rowIndex);
	}

##Modifying List Rows

Sometimes a list row will need to be modified. For example, if a user clicks on a row, the application
might want to indicate that the row has been selected by making a color change. In this case,
a row item could have an onclick handler that stores the index of the selected row. The onSetupRow
handler would use this information to decorate the selected row. To instruct the list to render, call the
refresh method. Here's an example:

	itemClick: function(inSender, inEvent) {
		this.selectedRow = inEvent.rowIndex;
	},
	setupRow: function(inSender, inIndex) {
		// check if the row is selected
		var isRowSelected = (inIndex == this.selectedRow);
		// color the row if it is
		this.$.item.applyStyle("background", isRowSelected ? "blue" : null);
		// ...
	}

##Data Handling

It's common for an application to have a set of data that should be displayed as a list. Here's an example
that uses an array of data to display list rows:

	data: [
		{color: "Green", action: "Go"}, 
		{color: "Yellow", action: "Go Faster"}
		{color: "Red", action: "Stop"}
	],
	setupRow: function(inSender, inIndex) {
		var row = this.data[inIndex];
		if (row) {
			this.$.content.setContent("When you see a " + row.color + " light:");
			this.$.button.setContent(row.action);
			return true;
		}
	}
	
Sometimes it isn't practical to gather all the data that needs to be rendered in a list, all at one time.
VirtualList provides the onAcquirePage event to allow an application to perform work, such as retrieving data,
when a section of the list needs to be rendered. The number of items VirtualList expects to be in each page
is determined by the pageSize property.

For example, this service call could be made to acquire some data for a page of list items:

	{kind: "VirtualList", onAcquirePage: "acquireListPage", onSetupRow: "setupRow", components: [

	// ...

	acquireListPage: function(inSender, inPage) {
		var index = inPage * inSender.pageSize;
		// if we don't have data for this page...
		if (!this.data[index]) {
			// get it from a service
			this.$.service.call({index: index}, {index: index, onSuccess: "dataResponse"})
		}
	}

In this case, the data is not available until the service responds. We've passed the index
of the data row to retrieve to the service request object, so we can use it to populate our data array when
the service responds.

Again, when the list should be re-rendered, call the refresh method.

	dataResponse: function(inSender, inResponse, inRequest) {
		// put the retrieved data into the application's store of data (method omitted)
		this.storeData(inRequest.index, inResponse.results);
		//
		// prompt the list to render.
		this.$.list.refresh();
	}
*/
enyo.kind({
	name: "enyo.VirtualList",
	kind: enyo.ScrollingList,
	published: {
		lookAhead: 2,
		pageSize: 10
	},
	events: {
		onAcquirePage: "",
		onDiscardPage: ""
	},
	//* @protected
	initComponents: function() {
		this.inherited(arguments);
		this.createComponents([
			{kind: "Selection", onClear: "selectionCleared", onDeselect: "updateRowSelection", onSelect: "updateRowSelection"},
			{kind: "Buffer", overbuffer: this.lookAhead, margin: 3, onAcquirePage: "doAcquirePage", onDiscardPage: "doDiscardPage"}
		]);
	},
	//* @public
	/** 
	 Set the selection state for the given row index. 
	*/
	select: function(inRowIndex, inData) {
		return this.$.selection.select(inRowIndex, inData);
	},
	/** 
	 Get the selection state for the given row index.
	*/
	isSelected: function(inRowIndex) {
		return this.$.selection.isSelected(inRowIndex);
	},
	/** 
	 Enable/disable multi-select mode
	*/
	setMultiSelect: function(inMulti) {
		this.$.selection.setMulti(inMulti);
		this.refresh();
	},
	/** 
	Returns the selection component (<a href="#enyo.Selection">enyo.Selection</a>) that manages the selection
	state for this list.
	*/
	getSelection: function() {
		return this.$.selection;
	},
	//* @protected
	updateRowSelection: function(inSender, inRowIndex) {
		this.updateRow(inRowIndex);
	},
	resizeHandler: function() {
		if (this.hasNode()) {
			//this.log();
			this.$.scroller.measure();
			// FIXME: if we refresh, then we always re-render the dom, which seems 
			// unncessary and over-aggressive.
			// if we merely update, then we don't blap away a rendering if list is hidden.
			// in addition, it's more compatible with controls that have a render-specific state like editors
			//this.update();
			this.refresh();
			this.$.scroller.start();
		} else {
			this.log("no node");
		}
	},
	//* @protected
	rowToPage: function(inRowIndex) {
		return Math.floor(inRowIndex / this.pageSize);
	},
	adjustTop: function(inSender, inTop) {
		var page = this.rowToPage(inTop);
		this.$.buffer.adjustTop(page);
	},
	adjustBottom: function(inSender, inBottom) {
		var page = this.rowToPage(inBottom);
		this.$.buffer.adjustBottom(page);
	},
	reset: function() {
		this.$.buffer.bottom = this.$.buffer.top - 1;
		this.inherited(arguments);
	},
	punt: function() {
		var b = this.$.buffer;
		// dump data buffer
		b.flush();
		b.top = b.specTop = 0;
		b.bottom = b.specBottom = -1;
		this.inherited(arguments);
	}
});
