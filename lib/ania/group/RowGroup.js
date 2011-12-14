/**
A <a href="#enyo.Group">Group</a> in which each control is automatically
displayed in an <a href="#enyo.Item">Item</a>, so they have small guide lines between them.

Here's an example:

	{kind: "RowGroup", content: "Audio/Video Options", components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "Sound", flex: 1},
			{kind: "ToggleButton"}
		]},
		{layoutKind: "HFlexLayout", components: [
			{content: "Video", flex: 1},
			{kind: "ToggleButton"}
		]}
	]}
*/
enyo.kind({
	name: "enyo.RowGroup",
	kind: enyo.Group,
	components: [
		{name: "content", kind: "Control", className: "enyo-group-content"},
		// NOTE: row styling applied by the layoutKind here.
		{name: "client", kind: "OrderedContainer", className: "enyo-group-inner"}
	],
	defaultKind: "enyo.Item",
	//* @protected
	constructor: function() {
		this.rows = [];
		this.inherited(arguments);
	},
	// NOTE: to preserve row styling and add highlighting item behavior, 
	// wrap controls in an Item
	addChild: function(inChild) {
		if (!inChild.isChrome && !(inChild instanceof enyo.Item)) {
			var item = this.createComponent({kind: "RowItem", tapHighlight: inChild.tapHighlight, isRowWrapper: true});
			item.addChild(inChild);
		} else {
			this.inherited(arguments);
		}
	},
	addControl: function(inControl) {
		if (this.controlIsRow(inControl)) {
			this.rows.push(inControl);
		}
		this.inherited(arguments);
	},
	removeControl: function(inControl) {
		if (this.controlIsRow(inControl)) {
			enyo.remove(inControl, this.rows);
		}
		this.inherited(arguments);
	},
	controlIsRow: function(inControl) {
		return inControl instanceof enyo.Item;
	},
	// don't report wrapper items as controls.
	getClientControls: function() {
		var c$ = this.inherited(arguments);
		var r = [];
		for (var i=0, c; c=c$[i]; i++) {
			if (!c.isRowWrapper) {
				r.push(c);
			}
		}
		return r;
	},
	// FIXME: override due to inherited implementation using controls rather than getClientControls
	indexOfControl: function(inControl) {
		return enyo.indexOf(inControl, this.getClientControls());
	},
	rowAtIndex: function(inIndex) {
		return this.rows[inIndex];
	},
	flow: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			this.$.client.flow();
		}
	},
	//* @public
	/**
	Show the row at the given inIndex.
	*/
	showRow: function(inIndex) {
		var c = this.rowAtIndex(inIndex);
		if (c) {
			c.setShowing(true);
			this.$.client.flow();
		}
	},
	/**
	Hide the row at the given inIndex.
	*/
	hideRow: function(inIndex) {
		var c = this.rowAtIndex(inIndex);
		if (c) {
			c.setShowing(false);
			this.$.client.flow();
		}
	}
});

enyo.kind({
	name: "enyo.RowItem",
	kind: enyo.Item,
	//* @protected
	setOrderStyle: function(inClass) {
		if (this._orderClassName) {
			this.addRemoveOrderClassName(this._orderClassName, false);
		}
		this.addRemoveOrderClassName(inClass, true);
		this._orderClassName = inClass;
	},
	// note: when functioning as a wrapper, destroy if wrapped child is removed
	removeChild: function(inChild) {
		this.inherited(arguments);
		if (this.isRowWrapper) {
			this.destroy();
		}
	},
	addRemoveOrderClassName: function(inClass, inAdd) {
		this.addRemoveClass(inClass, inAdd);
		var c = this.children[0];
		if (c) {
			if (c.setOrderStyle) {
				c.setOrderStyle(inClass);
			} else {
				c.addRemoveClass(inClass, inAdd);
			}
		}
	}
});
