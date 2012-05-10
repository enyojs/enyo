/**
	Provides a wrapper around multiple elements. Enables creation of radio groups from arbitrary components supporting the [GroupItem](#enyo.GroupItem) api.
*/
enyo.kind({
	name: "enyo.Group",
	published: {
		//* Can there be only one?
		highlander: true,
		//* The control that is selected
		active: null
	},
	//* @protected
	handlers: {
		onActivate: "activate"
	},
	activate: function(inSender, inEvent) {
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
