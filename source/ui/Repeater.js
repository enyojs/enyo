/**
	A simple control for making lists of items.

	Components of Repeater are copied for each item created, wrapped in a control keeping state of the item index.

	Example:

		{kind: "Repeater", items: 2, onSetupItem: "setImageSource", components: [
			{kind: "Image"}
		]}

		setImageSource: function(inSender, inEvent) {
			var index = inEvent.index;
			var itemControl = inEvent.item;
			itemControl.$.image.setSrc(this.imageSources[index]);
			return true;
		}

	Be sure to return true from your onSetupItem handler to avoid having other events
	handlers further up the tree also try modify your item control.
*/
enyo.kind({
	name: "enyo.Repeater",
	published: {
		//* Number of items
		items: 0
	},
	events: {
		//* Sends the item index, and the item control, for decoration
		onSetupItem: ""
	},
	create: function() {
		this.inherited(arguments);
		this.itemsChanged();
	},
	//* @protected
	initComponents: function() {
		this.itemComponents = this.components || this.kindComponents;
		this.components = this.kindComponents = null;
		this.inherited(arguments);
	},
	setItems: function(inItems) {
		this.setPropertyValue("items", inItems, "itemsChanged");
	},
	itemsChanged: function() {
		this.build();
	},
	//* @public
	//* Render the list
	build: function() {
		this.destroyClientControls();
		for (var i=0, c; i<this.items; i++) {
			c = this.createComponent({kind: "enyo.OwnerProxy", index: i});
			// do this as a second step so 'c' is the owner of the created components
			c.createComponents(this.itemComponents);
			// invoke user's setup code
			this.doSetupItem({index: i, item: c});
		}
		this.render();
	}
});

// sometimes client controls are intermediated with null-controls
// these overrides reroute events from such controls to the nominal delegate,
// as would happen if we hadn't intermediated
enyo.kind({
	name: "enyo.OwnerProxy",
	tag: null,
	decorateEvent: function(inEventName, inEvent, inSender) {
		inEvent.index = this.index;
		this.inherited(arguments);
	},
	delegateEvent: function(inDelegate, inName, inEventName, inEvent, inSender) {
		if (inDelegate == this) {
			inDelegate = this.owner.owner;
		}
		this.inherited(arguments, [inDelegate, inName, inEventName, inEvent, inSender]);
	}
});