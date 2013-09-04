/**
	_enyo.Group_ provides a wrapper around multiple elements.  It enables the
	creation of radio groups from arbitrary components supporting the
	[GroupItem](#enyo.GroupItem) API.
*/
enyo.kind({
	name: "enyo.Group",
	published: {
		/**
			If true, only one GroupItem in the component list may be active at
			a given time.
		*/
		highlander: true,
		//* The control that was last selected
		active: null,
		/**
			The `groupName` property is used to scope this group to a certain
			set of controls.  When used, the group only controls activation of controls who
			have the same `groupName` property set on them.
		*/
		groupName: null
	},
	//* @protected
	handlers: {
		onActivate: "activate"
	},
	activate: function(inSender, inEvent) {
		if ((this.groupName || inEvent.originator.groupName) && (inEvent.originator.groupName != this.groupName)) {
			return;
		}
		if (this.highlander) {
			// deactivation messages are ignored unless it's an attempt
			// to deactivate the highlander
			if (!inEvent.originator.active) {
				// this clause prevents deactivating a grouped item once it's been active.
				// the only proper way to deactivate a grouped item is to choose a new
				// highlander.
				if (inEvent.originator == this.active) {
					this.active.setActive(true);
				}
			} else {
				this.setActive(inEvent.originator);
			}
		}
	},
	activeChanged: function(inOld) {
		if (inOld) {
			inOld.setActive(false);
			inOld.removeClass("active");
		}
		if (this.active) {
			this.active.addClass("active");
		}
	}
});
