/**
A control designed to display a group of stacked items, typically used in lists. Items
have small guide lines between them and, by default, are highlighted when tapped. Set
tapHighlight to false to prevent the highlighting.

	{flex: 1, name: "list", kind: "VirtualList", onSetupRow: "listSetupRow", components: [
		{kind: "Item", onclick: "listItemClick"}
	]}
*/
enyo.kind({
	name: "enyo.Item",
	kind: enyo.Stateful,
	className: "enyo-item",
	published: {
		tapHighlight: false,
		//* @protected
		selected: false,
		held: false,
		//* @public
		disabled: false
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
	},
	destroy: function() {
		this.cancelClickJob();
		this.inherited(arguments);
	},
	heldChanged: function() {
		if (!this.tapHighlight) {
			return;
		}
		this.stateChanged("held");
	},
	selectedChanged: function() {
		this.stateChanged("selected");
	},
	disabledChanged: function() {
		this.stateChanged("disabled");
	},
	mouseholdHandler: function(inSender, inEvent) {
		if (this.disabled) {
			return;
		}
		this.setHeld(true);
		this.fire("onmousehold", inEvent);
	},
	mousereleaseHandler: function(inSender, inEvent) {
		this.setHeld(false);
		this.fire("onmouserelease", inEvent);
	},
	clickHandler: function(inSender, inEvent) {
		if (!this.disabled) {
			// allow only one held item at a time (prevents ever showing multiple helds,
			// which can happen if system bogs)
			if (enyo.Item.clickJob) {
				enyo.Item.clickJob();
			}
			// make sure we show "held" before clicking
			this.setHeld(true);
			// on a delay click and remove held state, flyweight safe:
			// update held property without rendering a change.
			enyo.Flyweight.callWithoutNode(this, enyo.bind(this, "setHeld", false));
			// cache info so that if flyweight context is reset we update properly
			this.makeClickJob(this.hasNode(), this.attributes.className, inEvent);
		}
	},
	_clickJobName: "enyo.Item:click",
	makeClickJob: function(inNode, inClassName, inEvent) {
		enyo.Item.clickJob = enyo.hitch(this, function() {
			if (inNode) {
				inNode.className = inClassName;
			}
			this.cancelClickJob();
			this.doClick(inEvent, inEvent.rowIndex);
		});
		enyo.job(this._clickJobName, enyo.Item.clickJob, 100);
	},
	cancelClickJob: function() {
		enyo.job.stop(this._clickJobName);
		enyo.Item.clickJob = null;
	}
});