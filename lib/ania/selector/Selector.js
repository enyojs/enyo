/**
A control that provides a display similar to an html select, used to 
select one item from a set of many choices. When the Selector is tapped, 
a scrolling popup of available choices is shown. The user taps an item
to select it, closing the popup and changing the displayed item to the selected one.

The items for a Selector can be specified as an array of strings
or objects specifying a content and a value. For example:

	components: [
		{kind: "Selector", value: 2, onChange: "itemChanged", items: [
			{content: "One", value: 1},
			{content: "Two", value: 2},
			{content: "Three", value: 3},
		]}
	],
	itemChanged: function(inSender, inValue, inOldValue) {
		this.setSomeOption(inValue);
	}
	
Selector uses <a href="#enyo.PopupList">PopupList</a> which uses
<a href="#enyo.VirtualRepeater">VirtualRepeater</a> to render items to optimize
creation and rendering time.  This makes Selector less customizable, for example
it can't have different kinds for items.  If you need to customize Selector use
<a href="#enyo.CustomSelector">CustomSelector</a>.

The onChange event fires when the selected item changes. Note that the onChoose event
fires whenever an item is chosen.

The value of a Selector may be set directly or retrieved as follows:

	buttonClick: function() {
		if (this.$.listSelector.getValue() > 10) {
			this.$.listSelector.setValue(10);
		}
	}

Note that you cannot set a value not in the items list.

The property <code>hideItem</code> can be used to hide the displayed item.

*/
enyo.kind({
	name: "enyo.Selector",
	kind: enyo.CustomSelector,
	//* @protected
	makePopup: function() {
		this.popup = this.createComponent({
			kind: "PopupList",
			clearSelectionOnOpen: false,
			onChoose: "popupChoose",
			onBeforeOpen: "popupBeforeOpen",
			onSetupItem: "popupSetupItem",
			defaultKind: this.popupItemKind
		});
	},
	popupSetupItem: function(inSender, inItem, inRowIndex, inRowItem) {
		inItem.setIcon(inRowItem.icon);
		inItem.setChecked(inRowIndex == inSender.selected);
	}
});
