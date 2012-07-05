/** 
	The base kind for the Grouping API. Publishes an "active" property to manage the
	active state of the component (or inheriting component). A sub-kind may call setActive to
	set the active property to the desired state which will additionally bubble an _onActivate_
	event that can be handled as necessary by the containing components. This is useful for
	creating groups of items that require their state managed as a group.
	
	An example of using the _onActivate_ event can be seen in the <a href="#enyo.Group">enyo.Group</a>
	kind, which enables the	creation of radio groups from arbitrary components that support the
	Grouping API.
*/

enyo.kind({
	name: "enyo.GroupItem",
	published: {
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
