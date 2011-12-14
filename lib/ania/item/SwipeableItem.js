/**
An item that can be swiped to show an inline confirmation prompt with confirm and cancel buttons.
It is typically used to support swipe-to-delete in lists.

The onConfirm event is fired when the user taps the confirm button, or when the user swipes the item while confirmRequired is false. The event provides the index of the item. For example:

	components: [
		{flex: 1, name: "list", kind: "VirtualList", onSetupRow: "listSetupRow", components: [
			{kind: "SwipeableItem", onConfirm: "deleteItem"}
		]}
	],
	deleteItem: function(inSender, inIndex) {
		// remove data
		this.someData.splice(inIndex, 1);
	}

*/
enyo.kind({
	name: "enyo.SwipeableItem",
	kind: enyo.Item,
	published: {
		/**
		Set to false to prevent swiping.
		*/
		swipeable: true,
		/**
		If false, no confirm prompt is displayed, and swipes immediately trigger an onConfirm event.
		*/
		confirmRequired: true,
		/**
		Content shown for the confirm button in the confirm prompt.
		*/
		confirmContent: enyo._$L("Delete"),
		/**
		Content shown for the cancel button in the confirm prompt.
		*/
		cancelContent: enyo._$L("Cancel"),
		confirmShowing: false,
		/**
		If the confirm prompt is automatically hidden, for example, in a list context when a confirm prompt
		is shown for another row, automatically send an onConfirm event.
		*/
		confirmWhenAutoHidden: false,
		/**
		Allows the item to be swiped to the left.
		*/
		allowLeft: true
	},
	triggerRatio: 0.35,
	className: "enyo-item enyo-swipeableitem",
	lastConfirmIndex: null,
	events: {
		/**
		Event fired when the user clicks the confirm button or, if confirmRequired is false, when the item is swiped.
		The event includes the index of the swiped item.
		*/
		onConfirm: "",
		/**
		Event fired when the user clicks the cancel button in the confirm prompt.
		The event includes the index of the swiped item.
		*/
		onCancel: "",
		/**
		Event fired when the user swipes the item.
		The event includes the index of the swiped item.
		*/
		onSwipe: "",
		/**
		Event fired when the confirm prompt is shown or hidden.
		*/
		onConfirmShowingChanged: "",
		/**
		Event fired repeatedly as the item is dragged.
		Includes the total x pixel delta from at-rest position.
		*/
		onDrag: ""
	},
	components: [
		{name: "confirm", canGenerate: false, showing: false, kind: "ScrimmedConfirmPrompt", className: "enyo-fit", onConfirm: "confirmSwipe", onCancel: "cancelSwipe"}
	],
	statified: {
		confirmGenerated: false
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.confirmContentChanged();
		this.cancelContentChanged();
	},
	confirmContentChanged: function() {
		this.$.confirm.setConfirmContent(this.confirmContent);
	},
	cancelContentChanged: function() {
		this.$.confirm.setCancelContent(this.cancelContent);
	},
	// when item clicks, it briefly shows its held state, we want to 
	// avoid this when we're confirming.
	clickHandler: function(inSender, inEvent) {
		if (!this.confirmShowing) {
			this.inherited(arguments);
		}
	},
	flickHandler: function(inSender, inEvent) {
		// we need to squelch flicks if we are dragging to prevent spillover into scrollers
		return this.handlingDrag;
	},
	dragstartHandler: function(inSender, inEvent) {
		this.resetPosition();
		if (this.swipeable && inEvent.horizontal && !this.confirmShowing && this.hasNode()) {
			this.triggerDistance = this.fetchTriggerDistance();
			this.index = inEvent.rowIndex;
			this.handlingDrag = true;
			return true;
		} else {
			return this.fire("ondragstart", inEvent);
		}
	},
	dragHandler: function(inSender, inEvent) {
		var dx = this.getDx(inEvent);
		if (this.handlingDrag) {
			if (this.hasNode()) {
				this.node.style.webkitTransform = "translate3d(" + dx + "px, 0, 0)";
				this.doDrag(dx);
			} else {
				// FIXME: This can occur if a RowServer generates a row node (therefore disabling node access)
				enyo.log("drag with no node!");
			}
			return true;
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.handlingDrag) {
			var dx = this.getDx(inEvent);
			inEvent.preventClick();
			this.handlingDrag = false;
			this.resetPosition();
			if (Math.abs(dx) > this.triggerDistance) {
				this.handleSwipe();
			}
			return true;
		} else {
			this.fire("ondragfinish", inEvent);
		}
	},
	handleSwipe: function() {
		this.doSwipe(this.index);
		if (this.confirmRequired) {
			this.setConfirmShowing(true);
		} else {
			this.doConfirm(this.index);
		}
	},
	resetPosition: function() {
		if (this.hasNode()) {
			this.node.style.webkitTransform = "";
			this.doDrag(0);
		}
	},
	confirmShowingChanged: function() {
		// FIXME: jumping through hoops to satisfy flyweight usage
		// confirmGenerated is a "statified" property
		this.log(this.confirmShowing, this.confirmGenerated);
		if (!this.confirmGenerated) {
			var c = this.$.confirm;
			this.confirmGenerated = true;
			c.canGenerate = true;
			c.invalidateTags();
			c.render();
			// generate the node reference; if we're flyweighting, then hasNode
			// will find the incorrect node.
			if (this.node) {
				c.node = this.node.querySelector("[id="+c.id+"]");
			}
			// NOTE: do not turn off ability to generate so that we can set showing
			// when a list is generating content
			//c.canGenerate = false;
		}
		// if we've generated the confirm prompt, then always generate it
		// so we can show it in a list onSetupRow.
		this.$.confirm.canGenerate = this.confirmGenerated;
		// save show state since flyweight machinations can change it.
		var show = this.confirmShowing;
		var didAutoConfirm;
		if (show) {
			didAutoConfirm = this.confirmFlyweightSiblings();
			this.lastConfirmIndex = this.index;
		} else {
			this.lastConfirmIndex = null;
		}
		this.applyStyle("position", show ? "relative" : null);
		this.$.confirm.setShowing(show);
		this.doConfirmShowingChanged(show, this.index, didAutoConfirm);
	},
	// Find our container that has row api, if exists.
	findRowManager: function() {
		var m = this.parent;
		while (m) {
			if (m.prepareRow) {
				return this.rowManager = m;
			}
			m = m.parent;
		}
	},
	// FIXME: special handling for use in flyweight context.
	confirmFlyweightSiblings: function() {
		// note: if our container has "prepareRow" it supports flyweighting.
		var didAutoConfirm;
		var m = this.rowManager || this.findRowManager();
		if (m && m.prepareRow && this.lastConfirmIndex != null) {
			// shift flyweight to previous row with a showing confirm
			m.prepareRow(this.lastConfirmIndex);
			if (this.confirmShowing) {
				var i = this.index;
				// temporarily reset our index so events have correct data
				this.index = this.lastConfirmIndex;
				// hide confirm prompt and send an "auto" confirm.
				this.setConfirmShowing(false);
				if (this.confirmWhenAutoHidden) {
					didAutoConfirm = true;
					this.doConfirm(this.index);
				}
				this.index = i;
			}
			// reset our row to the proper one.
			m.prepareRow(this.index);
		}
		return didAutoConfirm;
	},
	confirmSwipe: function(inSender) {
		this.setConfirmShowing(false);
		this.doConfirm(this.index);
		return true;
	},
	cancelSwipe: function(inSender) {
		this.setConfirmShowing(false);
		this.doCancel(this.index);
		return true;
	},
	getDx: function(inEvent) {
		// Obey allowLeft in calculation of dx values.
		return inEvent.dx > 0 || this.allowLeft ? inEvent.dx : 0;
	},
	fetchTriggerDistance: function() {
		var w = this.getBounds().width || 0;
		return Math.floor(w * this.triggerRatio);
	}
});

