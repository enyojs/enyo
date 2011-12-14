/**
A control that displays a repeating list of rows. It is suitable for displaying medium-sized
lists (maximum of ~100 items). A <a href="#enyo.Flyweight">flyweight</a> strategy is employed to render one 
set of row controls as needed for as many rows as are contained in the repeater.

A VirtualRepeater's components block contains the controls to be used for a single row.
This set of controls will be rendered for each row.

The onSetupRow event allows for customization of row rendering. Here's a simple example:

	components: [
		{kind: "VirtualRepeater", onSetupRow: "getItem", components: [
			{kind: "Item", layoutKind: "HFlexLayout", components: [
				{name: "content", flex: 1},
				{kind: "Button", onclick: "buttonClick"}
			]}
		]}
	],
	getItem: function(inSender, inIndex) {
		if (inIndex < 100) {
			this.$.content.setContent("I am item: " + inIndex);
			this.$.button.setContent("Button" + inIndex);
			return true;
		}
	}

In the above example, the control named "item" will be rendered for each row. When a row is rendered, 
the onSetupRow event is fired with the row index.
The getItem method sets properties on controls in the row to customize the rendering of the row.
Notice that it returns true if the index is less than 100. An onSetupRow handler must 
return true to indicate that the given row should be rendered. If it does not, the repeater
will stop rendering.

Continuing with the above example, we have given the button an onclick handler. As previously noted, the button
is rendered for each of the 100 rows. The onclick handler will fire for a click on any of the row
buttons. It is common to need to know the exact row on which a user clicked. Events fired from within repeater rows
contain this information in the _rowIndex_ property of the DOM event object.
For example:

	buttonClick: function(inSender, inEvent) {
		this.log("The user clicked on item number: " + inEvent.rowIndex);
	}
*/
enyo.kind({
	name: "enyo.VirtualRepeater",
	kind: enyo.Control,
	events: {
		onSetupRow: ""
	},
	published: {
		accelerated: false,
		stripSize: 10
	},
	components: [
		{name: "client", kind: enyo.RowServer, onSetupRow: "doSetupRow"}
	],
	//* @protected
	generateInnerHtml: function() {
		this.$.client.clearState();
		var stripClass = this.accelerated ? ' class="enyo-virtual-repeater-strip"' : '';
		var h = '';
		var i = 0;
		do {
			h += '<div' + stripClass + '>';
			for (var j=0, c; j<this.stripSize && (c=this.$.client.generateRow(i)); i++, j++) {
				h += c;
			}
			h += '</div>';
		} while (c);
		return h;
	},
	validateControls: function() {
		this.$.client.validateControls();
	},
	addControl: function(inControl) {
		this.inherited(arguments);
		this.validateControls();
	},
	//* @public
	/**
		Re-renders the content for a given row.
		_inRowIndex_ is the numeric index of the row to render.
	*/
	renderRow: function(inRowIndex) {
		this.prepareRow(inRowIndex);
		this.doSetupRow(inRowIndex);
	},
	//* @protected
	prepareRow: function(inRowIndex) {
		return this.$.client.prepareRow(inRowIndex);
	},
	//* @public
	/**
		Updates the repeater's controls to act as if they were rendered in the row with the given index.
		_inRowIndex_ is the numeric index of the row to prepare.
	*/
	controlsToRow: function(inRowIndex) {
		this.$.client.controlsToRow(inRowIndex);
	},
	/**
		Fetches the index of the row that is currently receiving events.
	*/
	fetchRowIndex: function() {
		return this.$.client.fetchRowIndex();
	},
	/**
		Fetches the DOM node for the given row index.
	*/
	fetchRowNode: function(inRowIndex) {
		return this.$.client.fetchRowNode(inRowIndex);
	},
	/**
		Fetches the row index for a node in a repeater row.
		_inNode_ is a node that is contained in a repeater row.
		Returns the index of the row in which inNode exists.
	*/
	fetchRowIndexByNode: function(inNode) {
		return this.$.client.fetchRowIndexByNode(inNode);
	}
});
