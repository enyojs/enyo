/**
	_enyo.Repeater_ is a simple control for making lists of items.

	Components of a repeater are copied for each item created, and are wrapped
	in a control that keeps the state of the item index.

	Example:

		{kind: "Repeater", count: 2, onSetupItem: "setImageSource", components: [
			{kind: "Image"}
		]}

		setImageSource: function(inSender, inEvent) {
			var index = inEvent.index;
			var item = inEvent.item;
			item.$.image.setSrc(this.imageSources[index]);
			return true;
		}

	Be sure to return true from your _onSetupItem_ handler to avoid having other
	event handlers further up the tree try to modify your item control.

	The repeater will always be rebuilt after a call to _setCount_, even if the
	count didn't change.  This differs from the behavior of most properties, in
	which no action happens when a set-value call doesn't modify the value.
	This is to accomodate potential changes to the data model for the repeater,
	which may happen to have the same item count as before.
*/
enyo.kind({
	name: "enyo.Repeater",
	published: {
		//* Number of items
		count: 0
	},
	events: {
		//* Sends the item index, and the item control, for decoration.
		onSetupItem: ""
	},
	create: function() {
		this.inherited(arguments);
		this.countChanged();
	},
	//* @protected
	initComponents: function() {
		this.itemComponents = this.components || this.kindComponents;
		this.components = this.kindComponents = null;
		this.inherited(arguments);
	},
	setCount: function(inCount) {
		this.setPropertyValue("count", inCount, "countChanged");
	},
	countChanged: function() {
		this.build();
	},
	itemAtIndex: function(inIndex) {
		return this.controlAtIndex(inIndex);
	},
	//* @public
	//* Render the list
	build: function() {
		this.destroyClientControls();
		for (var i=0, c; i<this.count; i++) {
			c = this.createComponent({kind: "enyo.OwnerProxy", index: i});
			// do this as a second step so 'c' is the owner of the created components
			c.createComponents(this.itemComponents);
			// invoke user's setup code
			this.doSetupItem({index: i, item: c});
		}
		this.render();
	}
});

// Sometimes client controls are intermediated with null-controls.
// These overrides reroute events from such controls to the nominal delegate,
// as would happen in the absence of intermediation.
enyo.kind({
	name: "enyo.OwnerProxy",
	tag: null,
	decorateEvent: function(inEventName, inEvent, inSender) {
		if (inEvent) {
			inEvent.index = this.index;
		}
		this.inherited(arguments);
	},
	delegateEvent: function(inDelegate, inName, inEventName, inEvent, inSender) {
		if (inDelegate == this) {
			inDelegate = this.owner.owner;
		}
		this.inherited(arguments, [inDelegate, inName, inEventName, inEvent, inSender]);
	}
});