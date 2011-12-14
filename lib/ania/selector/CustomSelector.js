/**
A control that provides a display similar to an html select, used to 
select one item from a set of many choices. When the CustomSelector is tapped, 
a scrolling popup of available choices is shown. The user taps an item
to select it, closing the popup and changing the displayed item to the selected one.

The items for a CustomSelector can be specified as an array of strings
or objects specifying a content and a value. For example:

	components: [
		{kind: "CustomSelector", value: 2, onChange: "itemChanged", items: [
			{content: "One", value: 1},
			{content: "Two", value: 2},
			{content: "Three", value: 3},
		]}
	],
	itemChanged: function(inSender, inValue, inOldValue) {
		this.setSomeOption(inValue);
	}

The onChange event fires when the selected item changes. Note that the onChoose event
fires whenever an item is chosen.

The value of a CustomSelector may be set directly or retrieved as follows:

	buttonClick: function() {
		if (this.$.customSelector.getValue() > 10) {
			this.$.customSelector.setValue(10);
		}
	}

Note that you cannot set a value not in the items list.

The property <code>hideItem</code> can be used to hide the displayed item.

*/
enyo.kind({
	name: "enyo.CustomSelector",
	kind: enyo.Control,
	published: {
		/**
		The currently selected value.
		*/
		value: undefined,
		/**
		An array of strings or objects specifying the item choices. If objects are specified,
		they are component configurations and do not specify a kind. Typically, a content and value
		are specified.
		*/
		items: [],
		/**
		A label descibing the set of available choices. It is shown to the left of the drop-down arrow.
		*/
		content: "",
		/**
		Hides the displayed item.
		*/
		hideItem: false,
		/**
		Hides the drop-down arrow.
		*/
		hideArrow: false,
		disabled: false,
		/**
			Determines with which side of the list selector to align the popup; defaults to right, can also be left.
		*/
		popupAlign: "right",
		/**
			Determines if the container of the list selector is packed to start (default), middle, or end.
		*/
		containerPack: "start"
	},
	events: {
		/**
		Event fired when the selected value changes. The event sends both the current and previous values.
		*/
		onChange: "",
		/**
		Event fired whenever an item is chosen, even if it is the same item that was previously chosen.
		*/
		onChoose: ""
	},
	layoutKind: "HFlexLayout",
	itemKind: "MenuCheckItem",
	popupItemKind: "MenuCheckItem",
	className: "enyo-selector",
	align: "center",
	components: [
		{name: "container", kind: "HFlexBox", flex: 1, components: [
			{name: "itemContainer", flex: 1},
			{name: "client"}
		]},
		{name: "content", className: "enyo-selector-content enyo-content"},
		{name: "arrow", className: "enyo-selector-arrow"}
	],
	//* @protected
	create: function(inProps) {
		this.inherited(arguments);
		this.popupItemKind = this.popupItemKind || this.itemKind;
		this.containerPackChanged();
		this.itemsChanged();
		this.disabledChanged();
		this.hideArrowChanged();
	},
	initComponents: function() {
		this.inherited(arguments);
		this.makeItem();
		this.makePopup();
	},
	makeItem: function() {
		this.item = this.$.itemContainer.createComponent(
			{kind: this.itemKind, itemClassName: "enyo-selector-item", tapHighlight: false, owner: this}
		);
	},
	makePopup: function() {
		this.popup = this.createComponent({
			kind: "PopupSelect",
			clearSelectionOnOpen: false,
			onBeforeOpen: "popupBeforeOpen",
			onChoose: "popupChoose",
			defaultKind: this.popupItemKind
		});
	},
	disabledChanged: function() {
		this.$.itemContainer.addRemoveClass("enyo-disabled", this.disabled);
	},
	containerPackChanged: function() {
		this.$.container.pack = this.containerPack;
		this.$.container.flow();
	},
	hideItemChanged: function() {
		this.item.setShowing(!this.hideItem);
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
		this.$.content.setShowing(this.content);
	},
	hideArrowChanged: function() {
		this.$.arrow.setShowing(!this.hideArrow);
	},
	openPopup: function(inEvent) {
		this.popup.openAroundControl(this, false, this.popupAlign);
	},
	popupBeforeOpen: function() {
		this.valueChanged();
	},
	clickHandler: function(inSender, inEvent) {
		if (!this.disabled) {
			this.doClick(inEvent);
			this.openPopup(inEvent);
		}
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.popup.resized();
	},
	itemsChanged: function() {
		this.items = this.items || [];
		this.popup.setItems(this.items);
		this.item.setShowing(this.items && this.items.length);
		this.valueChanged();
	},
	valueChanged: function(inOldValue) {
		if (!this.popup.fetchItemByValue(this.value)) {
			this.value = this.fetchDefaultValue();
		}
		if (this.value != inOldValue) {
			this.popup.setSelectedByValue(this.value);
			var i = this.popup.fetchItemByValue(this.value);
			this.updateItem(i);
		}
	},
	fetchDefaultValue: function() {
		return this.popup.fetchValueByIndex(0);
	},
	updateItem: function(inItem) {
		if (!this.hideItem) {
			this.setItemProps(inItem);
		}
		this.hideItemChanged();
	},
	setItemProps: function(inItem) {
		this.item.setContent(inItem.content);
		this.item.setIcon(inItem.icon);
	},
	popupChoose: function(inSender, inSelected, inOldSelected) {
		var v = this.popup.fetchSelectedValue();
		this.doChoose(inSelected, inOldSelected);
		if (v !== undefined) {
			var oldValue = this.value;
			this.setValue(v);
			if (this.value != oldValue) {
				this.doChange(this.value, oldValue);
			}
		}
	}
});
