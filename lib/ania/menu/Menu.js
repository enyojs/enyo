/**
A control that displays a set of items in a popup.

	{kind: "Menu"}
	
Items can be specified as child components of the Menu:

	{kind: "Menu", components: [
		{content: "Palm"},
		{content: "Yahoo"},
		{content: "Facebook"}
	]}

By default, items are instances of <a href="#enyo.MenuItem">MenuItem</a>.  But you can change this to use different kinds for items.
Here is an example using <a href="#enyo.MenuCheckItem">MenuCheckItem</a>:

	{kind: "Menu", defaultKind: "MenuCheckItem"}

To open the popup menu at the center, do the following:

	openPopup: function() {
		this.$.menu.openAtCenter();
	}
*/
enyo.kind({
	name: "enyo.Menu",
	kind: enyo.Popup,
	published: {
		// whenever the menu is opened, any sub-items will be shown closed
		autoCloseSubItems: true,
		selected: null,
		clearSelectionOnOpen: true,
		selectionHighlight: true,
		// if true, items may be selected via keyboard
		keyboardSelect: true
	},
	events: {
		onHighlight: "",
		onChoose: ""
	},
	modal: true,
	showFades: true,
	className: "enyo-popup enyo-popup-menu",
	menuChrome: [
		{name: "client", className: "enyo-menu-inner", kind: "BasicScroller", onScroll: "scrollerScroll", autoVertical: true, vertical: false, layoutKind: "OrderedLayout"}
	],
	defaultKind: "MenuItem",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.styleLastItem();
	},
	componentsReady: function() {
		if (this.showFades) {
			this.createChrome([{kind: "ScrollFades", className: "enyo-menu-scroll-fades", topFadeClassName: "enyo-menu-top-fade", bottomFadeClassName: "enyo-menu-bottom-fade", leftFadeClassName: "", rightFadeClassName: ""}]);
		}
		this.createChrome(this.menuChrome);
		this.inherited(arguments);
		
	},
	removeControl: function(inControl) {
		this.inherited(arguments);
		if (inControl == this._lastItem) {
			this._lastItem = null;
		}
	},
	destroyClientControls: function() {
		this._lastItem = null;
		this.inherited(arguments);
	},
	prepareOpen: function() {
		if (this.inherited(arguments)) {
			if (this.clearSelectionOnOpen) {
				this.setScrollTop(0);
				this.setSelected(null);
			}
			return true;
		}
	},
	showingChanged: function() {
		if (this.showing) {
			if (this.autoCloseSubItems) {
				for (var i=0, c$=this.getItemControls(), c; c=c$[i]; i++) {
					enyo.call(c, "closeAll");
				}
			}
		}
		this.inherited(arguments);
	},
	scrollerScroll: function() {
		this.$.scrollFades && this.$.scrollFades.showHideFades(this.$.client);
	},
	getItemControls: function() {
		return this.getClientControls();
	},
	fetchItemByValue: function(inValue) {
		var items = this.getItemControls();
		for (var i=0, c; c=items[i]; i++) {
			if (c.getValue && c.getValue() == inValue) {
				return c;
			}
		}
	},
	scrollIntoView: function(inY, inX, inMoveToTop) {
		if (this.isOpen) {
			this.$.client.scrollIntoView(inY, inX, inMoveToTop);
			this.$.client.calcAutoScrolling();
		}
	},
	setScrollTop: function(inY) {
		if (this.isOpen) {
			this.$.client.setScrollTop(inY);
		}
	},
	flow: function() {
		this.inherited(arguments);
		this.styleLastItem();
	},
	// get this items last descendent
	findLastItem: function(inItem) {
		if (inItem.getOpen && !inItem.getOpen()) {
			return inItem;
		} else {
			var i$ = inItem.getItemControls();
			var c = i$.length;
			return c ? this.findLastItem(i$[c-1]) : inItem;
		}
	},
	// NOTE: dynamically style the very bottom visible menu item
	// this is so that we can make sure to hide any bottom border.
	styleLastItem: function() {
		//return;
		if (this._lastItem && !this._lastItem.destroyed) {
			this._lastItem.addRemoveMenuLastStyle(false);
		}
		var b = this.findLastItem(this);
		if (b && b.addRemoveMenuLastStyle) {
			b.addRemoveMenuLastStyle(true);
			this._lastItem = b;
		}
	},
	keyMap: {
		"Up": "keySelectPrevious",
		"Down": "keySelectNext",
		"Enter": "keyChoose",
		"Right": "keySetSelectedOpen",
		"Left": "keySetSelectedClosed",
		"U+0009": "keyChoose" // tab
	},
	findKeyHandler: function(inEvent) {
		return this.keyMap[inEvent.keyIdentifier];
	},
	callKeyHandler: function(inMethod, inEvent) {
		enyo.call(this, inMethod, [inEvent]);
	},
	keydownHandler: function(inSender, inEvent) {
		var r = this.inherited(arguments);
		if (this.keyboardSelect) {
			var h = this.findKeyHandler(inEvent);
			if (h) {
				this.callKeyHandler(h, inEvent);
			}
		}
		return r;
	},
	keySelectPrevious: function() {
		if (this.selectPrevious()) {
			this.fireHighlightEvent();
		}
	},
	keySelectNext: function() {
		if (this.selectNext()) {
			this.fireHighlightEvent();
		}
	},
	keySetSelectedOpen: function() {
		enyo.call(this.getSelected(), "setOpen", [true]);
	},
	keySetSelectedClosed: function() {
		enyo.call(this.getSelected(), "setOpen", [false]);
	},
	keyChoose: function() {
		this.close();
		this.fireChooseEvent();
	},
	// NOTE: fired via MenuItem.onclick
	menuItemClick: function(inSender) {
		this.setSelected(inSender);
		this.fireHighlightEvent();
		this.fireChooseEvent();
	},
	fireHighlightEvent: function() {
		this.doHighlight(this.getSelected(), this.lastSelected);
	},
	fireChooseEvent: function() {
		var s = this.getSelected();
		this.doChoose(s, this.lastSelected);
		// fire an onAction event on the selected item
		// (preferred over onclick because it occurs both when clicking and using keyboard)
		enyo.call(s, "fire", ["onAction"]);
	},
	selectedChanged: function(inOldItem) {
		if (this.selectionHighlight) {
			this.applySelectionHighlight(this.selected, inOldItem);
		}
		this.lastSelected = inOldItem;
		this.scrollSelectedIntoView();
	},
	applySelectionHighlight: function(inSelected, inDeselected) {
		enyo.call(inDeselected, "setSelected", [false]);
		enyo.call(inSelected, "setSelected", [true]);
	},
	scrollSelectedIntoView: function(inMoveToTop) {
		this.scrollItemIntoView(this.getSelected(), inMoveToTop);
	},
	scrollItemIntoView: function(inItem, inMoveToTop) {
		if (this.isOpen && inItem) {
			var b = inItem.getBounds();
			this.scrollIntoView(b.top, null, inMoveToTop);
			// to ensure entire item is in view, scroll the top and bottom into view.
			if (!inMoveToTop) {
				this.scrollIntoView(b.top + b.height);
			}
		}
	},
	scrollToItem: function(inItem) {
		if (this.isOpen) {
			var b = inItem.getBounds();
			this.setScrollTop(b.top);
		}
	},
	selectFirst: function() {
		var c = this.getItemControls()[0];
		if (c) {
			this.setSelected(c);
			return true;
		}
	},
	selectNext: function() {
		var s = this.getSelected();
		if (s || s == 0) {
			return this.selectSibling(s, 1);
		} else {
			return this.selectFirst();
		}
	},
	selectPrevious: function() {
		return this.selectSibling(this.getSelected(), -1);
	},
	selectSibling: function(inItem, inDelta) {
		var i = this.findSibling(inItem, inDelta);
		var s0 = this.getSelected();
		this.setSelected(i);
		// return true if selection changed
		return s0 != this.getSelected();
	},
	findSibling: function(inItem, inDelta) {
		// walk controls to find next/previous
		var c = inItem;
		var d = 0;
		while (c && d != inDelta) {
			c = inDelta > 0 ? this._findNextSibling(c) : this._findPreviousSibling(c);
			if (c && !c.getDisabled()) {
				d += inDelta > 0 ? 1 : -1;
			}
		}
		return c || inItem;
	},
	_findDirectSibling: function(inItem, inDelta) {
		var c = inItem.container;
		var items = enyo.call(c, "getItemControls") || [];
		var i = enyo.indexOf(inItem, items);
		return items[i+inDelta];
	},
	_findNextSibling: function(inItem) {
		if (inItem.hasItems() && inItem.getOpen()) {
			return inItem.getItems()[0];
		} else {
			var i = this._findDirectSibling(inItem, 1);
			if (!i && inItem.container != this) {
				i = this._findDirectSibling(inItem.container, 1);
			}
			return i;
		}
	},
	_findPreviousSibling: function(inItem) {
		var c = this._findDirectSibling(inItem, -1);
		if (c) {
			c = this.findLastItem(c);
		}
		if (!c && inItem.container != this) {
			c = inItem.container;
		}
		return c;
	}
});
