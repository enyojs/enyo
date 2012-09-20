/** 
	_enyo.GroupItem_ is the base kind for the Grouping API. It manages the
	active state of the component (or the inheriting component). A subkind may
	call _setActive_ to set the _active_ property to the desired state; this
	will additionally bubble an _onActivate_ event, which can be handled as
	needed by the containing components. This is useful for creating groups of
	items whose state should be managed as a group.

	For an example of how this works, see the
	<a href="#enyo.Group">enyo.Group</a> kind, which enables the creation of
	radio groups from arbitrary components that	support the Grouping API.
*/

enyo.kind({
	name: "enyo.GroupItem",
	published: {
		//* True if the item is currently selected
		active: false
	},
	//* @protected
	rendered: function() {
		this.inherited(arguments);
		this.activeChanged();
	},
	activeChanged: function() {
		this.bubble("onActivate");
	}
});
