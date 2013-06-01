/**
	_enyo.Repeater_ is a simple control for making lists of items.

	The components of a repeater are copied for each item created, and are
	wrapped	in a control that keeps the state of the item index.

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

	Be sure to return _true_ from your _onSetupItem_ handler to avoid having
	other event handlers further up the tree try to modify your item control.

	For more information, see the documentation on
	[Lists](https://github.com/enyojs/enyo/wiki/Lists) in the Enyo Developer
	Guide.
*/
enyo.kind({
	name: "enyo.Repeater",
	published: {
		//* Number of items
		count: 0
	},
	events: {
		/**
			Fires when each item is created.

			_inEvent.index_ contains the item's index.

			_inEvent.item_ contains the item control, for decoration.
		*/
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
	countChanged: function() {
		this.build();
	},
	itemAtIndex: function(inIndex) {
		return this.controlAtIndex(inIndex);
	},
	buildItem: function(inIndex) {
		var c = this.createComponent({kind: "enyo.OwnerProxy", index: inIndex});
		// do this as a second step so 'c' is the owner of the created components
		c.createComponents(this.itemComponents);
		// invoke user's setup code
		this.doSetupItem({index: inIndex, item: c});
		return c;
	},
	//* @public
	/** Renders the collection of items. This will delete any existing items and
		recreate the repeater if called after the repeater has been rendered.
		This is called automatically if _setCount_ is called, even if the count
		remains the same.
	*/
	build: function() {
		this.destroyClientControls();
		for (var i = 0; i < this.count; i++) {
			this.buildItem(i);
		}
		this.render();
	},
	/**
		Renders a specific item in the collection. This does not destroy the
		item, but just calls the _onSetupItem_ event handler again for it, so
		any state stored in	the item is preserved.
	*/
	renderRow: function(inIndex) {
		var c = this.itemAtIndex(inIndex);
		this.doSetupItem({index: inIndex, item: c});
	},
	/**
		Add _inCount_ items to the end of the repeater.  The _onSetupItem_
		handler will be called for each, with the items being rendered
		into the DOM one-by-one.
	*/
	addItems: function(inCount) {
		var start = this.count;
		this.count += inCount;
		for (var i = start; i < this.count; i++) {
			// render this node immediately because we don't want to 
			// re-render the initial items by rendering the parent.
			// This can be wasteful as the parent will reflow each time.
			this.buildItem(i).render();
		}
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
			// preserve an existing index property.
			if (enyo.exists(inEvent.index)) {
				// if there are nested indices, store all of them in an array
				// but leave the innermost one in the index property
				inEvent.indices = inEvent.indices || [inEvent.index];
				inEvent.indices.push(this.index);
			} else {
				// for a single level, just decorate the index property
				inEvent.index = this.index;
			}
			// update delegate during bubbling to account for proxy
			// by moving the delegate up to the repeater level
			if (inEvent.delegate && inEvent.delegate.owner === this) {
				inEvent.delegate = this.owner;
			}
		}
		this.inherited(arguments);
	},
	// extending enyo.Component.delegateEvent
	delegateEvent: function(inDelegate, inName, inEventName, inEvent, inSender) {
		if (inDelegate == this) {
			inDelegate = this.owner.owner;
		}
		return this.inherited(arguments, [inDelegate, inName, inEventName, inEvent, inSender]);
	}
});