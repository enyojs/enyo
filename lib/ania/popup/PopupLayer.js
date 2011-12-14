enyo.kind({
	name: "enyo.PopupLayer",
	// since we render as body, do not set an id or make an event target.
	wantsEvents: false,
	kind: enyo.Control,
	//* @protected
	// to avoid rendering artifacts, do not render this control, instead 
	// force its node to be document.body
	create: function() {
		this.inherited(arguments);
		this.generated = true;
	},
	hasNode: function() {
		return this.generated && (this.node = document.body);
	},
	// specialized rendering to support lazy child rendering.
	getChildContent: function() {
		return "";
	},
	render: function() {
	},
	rendered: function() {
	},
	//avoid teardown since we render parent on demand while child is rendering.
	teardownChildren: function() {
	}
});

enyo.getPopupLayer = function() {
	if (!enyo._popupLayer) {
		var f = enyo._popupLayer = new enyo.PopupLayer();
		f.render();
	}
	return enyo._popupLayer;
};
