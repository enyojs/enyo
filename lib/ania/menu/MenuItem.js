/**
A item with icon and content.  It is meant to go inside a <a href="#enyo.Menu">Menu</a>.
*/
// FIXME: do we need (for simplicity / performance) an item that doesn't support sub-items?
enyo.kind({
	name: "enyo.MenuItem",
	kind: enyo.Control,
	published: {
		value: undefined,
		icon: "",
		orderStyle: "",
		open: false,
		// virtual property for item.selected
		selected: false,
		disabled: false,
		hideIcon: false,
		tapHighlight: true
	},
	indentPadding: 24,
	needsItemChrome: false,
	events: {
		onclick: "menuItemClick"
	},
	defaultKind: "MenuItem",
	basicChrome: [
		{name: "item", kind: enyo.Item, className: "enyo-menuitem", tapHighlight: true, align: "center", onclick: "itemClick"}
		// NOTE: item chrome and client are created if needed
	],
	itemChrome: [
		{name: "icon", kind: enyo.Image, className: "enyo-menuitem-icon"},
		{name: "content", kind: "Control", flex: 1},
		{name: "arrow", kind: enyo.CustomButton, toggling: true, showing: false, className: "enyo-menuitem-arrow"}
	],
	contentClassName: "enyo-menuitem-content",
	_depth: 0,
	constructor: function() {
		this.inherited(arguments);
		this.items = [];
	},
	//* @protected
	create: function(inProps) {
		this.inherited(arguments);
		if (this.value === undefined) {
			this.value = this.content;
		}
		this.content = this.content || this.value;
		this.$.item.addClass(this.itemClassName);
		this.iconChanged();
		this.openChanged();
		this.disabledChanged();
		this.tapHighlightChanged();
	},
	initComponents: function() {
		this.createChrome(this.basicChrome);
		this.inherited(arguments);
		if (this.needsItemChrome) {
			this.validateItemChrome();
		}
		this.setContentControl(this.$.item);
	},
	controlIsItem: function(inControl) {
		return inControl instanceof enyo.constructorForKind(this.defaultKind)
	},
	addControl: function(inControl) {
		// Optimization: dynamically add a client region, if we have controls.
		// FIXME: this optimization makes using MenuItem in a flyweight context problematic
		// because our controls can change while rendering.
		// For example, if a PopupList, which uses a flyweigted MenuItem has an icon only in 
		// its second item, but not its first, then these controls will change when the 2nd row
		// is rendered due to the call to setIcon.
		if (this.controlIsItem(inControl)) {
			this.items.push(inControl);
			if (!this.$.client) {
				this.validateItemChrome();
				this.$.arrow.setShowing(true);
				this.createChrome([{
					name: "client",
					kind: enyo.BasicDrawer,
					open: false,
					layoutKind: "OrderedLayout"
				}]);
			}
		}
		this.inherited(arguments);
	},
	removeControl: function(inControl) {
		if (this.controlIsItem(inControl)) {
			enyo.remove(inControl, this.items);
		}
		this.inherited(arguments);
	},
	getItems: function() {
		return this.items;
	},
	// FIXME: (non-ideal) alias for getItems to make api compatible with menu
	getItemControls: function() {
		return this.getItems();
	},
	validateItemChrome: function() {
		if (!this.$.content) {
			this.createItemChrome();
		}
	},
	createItemChrome: function() {
		this.$.item.setLayoutKind("HFlexLayout");
		this.$.item.createComponents(this.itemChrome, {owner: this});
		if (this.generated) {
			this.$.item.render();
		}
		this.setContentControl(this.$.content);
		this.contentChanged();
	},
	styleDepth: function() {
		this.$.item.applyStyle("padding-left", (this._depth * this.indentPadding) + "px");
	},
	hasItems: function() {
		return this.items.length;
	},
	flowMenu: function() {
		var controls = this.getItems();
		this.$.item.addRemoveClass("enyo-menu-has-items", controls.length);
		for (var i=0, c; c=controls[i]; i++) {
			if (c.styleDepth) {
				c._depth = this._depth +1;
				c.styleDepth();
			}
		}
	},
	flow: function() {
		this.flowMenu();
		// FIXME: it's important that contentClassName be set right before rendering to ensure
		// that it's not incorrectly set on the wrong contentControl.
		this.contentControl && this.contentControl.addClass(this.contentClassName);
		this.inherited(arguments);
	},
	setContentControl: function(inControl) {
		this.contentControl = inControl;
	},
	contentChanged: function() {
		this.contentControl.setContent(this.content);
	},
	iconChanged: function() {
		if (this.icon) {
			this.validateItemChrome();
		}
		if (this.$.icon) {
			this.$.icon.setSrc(this.icon ? enyo.path.rewrite(this.icon) : "");
			this.$.icon.setShowing(!this.hideIcon && this.icon);
		}
	},
	hideIconChanged: function() {
		this.$.icon.setShowing(!this.hideIcon);
	},
	disabledChanged: function() {
		this.$.item.setDisabled(this.disabled);
	},
	tapHighlightChanged: function() {
		this.$.item.tapHighlight = this.tapHighlight;
	},
	selectedChanged: function() {
		this.$.item.setSelected(this.selected);
	},
	getSelected: function() {
		return this.selected = this.$.item.getSelected();
	},
	fetchMenu: function() {
		var m = this.parent;
		while (m) {
			if (m instanceof enyo.Menu) {
				return m;
			}
			m = m.parent;
		}
	},
	itemClick: function(inSender, inEvent) {
		// automate closing of menu on click
		if (this.hasItems()) {
			this.setOpen(!this.open);
		} else {
			var m = this.fetchMenu();
			if (m) {
				m.close();
			}
		}
		// may need to inform our container we were clicked
		var m = this.fetchMenu();
		if (m != this.owner) {
			this.dispatch(m, "menuItemClick");
		}
		this.doClick(inEvent);
	},
	// defeat default click handling in favor of clicking on item.
	clickHandler: function() {
	},
	isLastControl: function() {
		var controls = this.container ? this.container.getClientControls() : [];
		return this == controls[controls.length-1];
	},
	openChanged: function() {
		if (this.$.client) {
			this.$.item.addRemoveClass("collapsed", !this.open);
			this.$.arrow.setDepressed(this.open);
			this.$.client.setOpen(this.open);
		}
		// NOTE: if we are the bottom control, tell menu we need to update bottom styling
		if (this.generated && this.isLastControl()) {
			var m = this.fetchMenu();
			if (m) {
				m.styleLastItem();
			}
		}
	},
	closeAll: function() {
		this.setOpen(false);
		for (var i=0, c$=this.getClientControls(), c; c=c$[i]; i++) {
			enyo.call(c, "closeAll");
		}
	},
	addRemoveMenuLastStyle: function(inLast) {
		this.$.item.addRemoveClass("enyo-menu-last", inLast);
	},
	orderStyleChanged: function(inOldOrderStyle) {
		this.$.item.removeClass(inOldOrderStyle);
		this.$.item.addClass(this.orderStyle);
	},
	addRemoveItemClass: function(inClass, inTrueToAdd) {
		this.$.item.addRemoveClass(inClass, inTrueToAdd);
	}
});
