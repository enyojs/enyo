/**
A <a href="#enyo.Menu">Menu</a> with support for selection.

	{kind: "PopupSelect", onChoose: "popupSelect"}

The onChoose event is fired when the user chooses an item, like so:

	popupSelect: function(inSender, inSelected) {
		var value = inSelected.getValue();
	}
*/
enyo.kind({
	name: "enyo.PopupSelect",
	kind: enyo.Menu,
	published: {
		/**
		An array of config objects or strings representing items. Note, specified components are 
		automatically added to the items array.
		Items are owned by the PopupSelect and therefore event handlers should not be specified on them.
		Use the onChoose event to respond to an item selection.
		*/
		items: []
	},
	className: "enyo-popup enyo-popup-menu enyo-popupselect",
	canCreateItems: false,
	//* @protected
	importProps: function(inProps) {
		if (inProps.components) {
			inProps.items = inProps.items ? inProps.items.concat(inProps.components) : inProps.components;
			inProps.components = [];
		}
		this.inherited(arguments);
	},
	componentsReady: function() {
		this.inherited(arguments);
		this.canCreateItems = true;
		this.itemsChanged();
	},
	itemsChanged: function() {
		this.selected = null;
		if (this.canCreateItems) {
			this.createItems();
		}
	},
	createItems: function() {
		this.destroyClientControls();
		for (var i=0, item, c; item=this.items[i]; i++) {
			item = enyo.isString(item) ? {content: item} : item;
			// we want these controls to be owned by us so we get events
			this.createComponent(item);
		}
		if (this.generated) {
			this.render();
		}
		this.hasItems = true;
	},
	//* @public
	setSelectedByValue: function(inValue) {
		this.setSelected(this.fetchItemByValue(inValue));
	},
	fetchItemByValue: function(inValue) {
		return !this.hasItems ? this.fetchItemDataByValue(inValue) : this.inherited(arguments);
	},
	//* @protected
	fetchSelectedValue: function() {
		return this.selected.getValue();
	},
	fetchItemDataByValue: function(inValue) {
		for (var i=0, v, c; c=this.items[i]; i++) {
			v = this.fetchItemValue(c);
			if (v == inValue) {
				c = enyo.isString(c) ? {value: c, content: c} : c;
				return c;
			}
		}
	},
	fetchItemByIndex: function(inIndex) {
		var c$ = this.getItemControls();
		return c$ && c$[inIndex];
	},
	fetchIndexByValue: function(inValue) {
		for (var i=0, c; c=this.items[i]; i++) {
			if (this.fetchItemValue(c) == inValue) {
				return i;
			}
		}
	},
	fetchItemValue: function(inItem) {
		return enyo.isString(inItem) ? inItem : (inItem.value === undefined ? inItem.content : inItem.value);
	},
	fetchValueByIndex: function(inIndex) {
		var i = this.items[inIndex];
		if (i !== undefined) {
			return this.fetchItemValue(i);
		}
	}
});
