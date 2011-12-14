/**
A <a href="#enyo.PopupSelect">PopupSelect</a> that renders items inside a <a href="#enyo.VirtualRepeater">VirtualRepeater</a>.

	{kind: "PopupList", onChoose: "popupChoose"}
	
To set items, use <code>setItems</code>:

	this.$.popupList.setItems([
		"Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	]);
*/
enyo.kind({
	name: "enyo.PopupList",
	kind: enyo.PopupSelect,
	events: {
		onSetupItem: ""
	},
	components: [
		{name: "list", kind: "VirtualRepeater", onSetupRow: "listSetupRow"}
	],
	//* @protected
	componentsReady: function() {
		this.inherited(arguments);
		this.createItem();
	},
	createItem: function() {
		this.$.list.createComponent({name: "item", kind: this.defaultKind, owner: this});
	},
	// NOTE: PopupList assumes items are strings; however, it's valid in its superclass Menu
	// for items to be objects.
	listSetupRow: function(inSender, inIndex) {
		var l = this.items.length;
		if (inIndex < l && this.$.item) {
			var item = this.items[inIndex];
			var content = enyo.isString(item) ? item : item.content;
			this.$.item.addRemoveItemClass("enyo-single", l == 1);
			this.$.item.addRemoveItemClass("enyo-first", inIndex == 0);
			this.$.item.addRemoveItemClass("enyo-last", inIndex == l-1);
			this.$.item.setContent(content);
			this.doSetupItem(this.$.item, inIndex, item);
			return true;
		}
	},
	itemsChanged: function() {
		if (this.$.list && this.generated) {
			this.$.list.render();
		}
	},
	// FIXME: In PopupList the selection is an index, *not* the item itself.
	menuItemClick: function(inSender, inEvent) {
		this.setSelected(inEvent.rowIndex);
		this.fireHighlightEvent();
		this.fireChooseEvent();
	},
	// find appropriate sibling index, instead of the defaultnot item
	findSibling: function(inIndex, inDelta) {
		var m = this.items.length - 1;
		var i = (inIndex || 0) + inDelta;
		i = Math.max(0, Math.min(i, m));
		return i;
	},
	applySelectionHighlight: function(inSelected, inDeselected) {
		var s = this.fetchItemByIndex(inDeselected);
		enyo.call(s, "setSelected", [false]);
		s = this.fetchItemByIndex(inSelected);
		enyo.call(s, "setSelected", [true]);
	},
	scrollItemIntoView: function(inItem, inMoveToTop) {
		var n = this.fetchRowNode(inItem), pn = this.$.list && this.$.list.hasNode();
		if (n && pn) {
			var offset = enyo.dom.calcNodeOffset(n, pn);
			this.scrollIntoView(offset.top, null, inMoveToTop);
			if (!inMoveToTop) {
				this.scrollIntoView(offset.bottom);
			}
		}
	},
	scrollToItem: function(inItem) {
		var n = this.fetchRowNode(inItem), pn = this.$.list && this.$.list.hasNode();
		if (n && pn) {
			var offset = enyo.dom.calcNodeOffset(n, pn);
			this.setScrollTop(offset.top);
		}
	},
	fetchRowNode: function(inIndex) {
		return this.$.list && this.$.list.fetchRowNode(inIndex);
	},
	setSelectedByValue: function(inValue) {
		this.setSelected(this.fetchIndexByValue(inValue));
	},
	fetchSelectedValue: function() {
		return this.fetchValueByIndex(this.selected);
	},
	fetchItemByIndex: function(inIndex) {
		if (this.$.list && this.$.list.prepareRow(inIndex)) {
			return this.$.item;
		}
	}
});