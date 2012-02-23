enyo.kind({
	name: "enyo._DragAvatar",
	style: "position: absolute; z-index: 10; pointer-events: none; cursor: move;",
	showing: false,
	/*
	rendered: function() {
		this.inherited(arguments);
		// NOTE: moving the node means we need special teardown below
		document.body.appendChild(this.hasNode());
	},
	teardownRender: function() {
		// NOTE: our node is in unexpected place, clean it up
		document.body.removeChild(this.node);
		this.inherited(arguments);
	},
	drag: function(inEvent) {
		//this.setBounds({top: inEvent.pageY - 50, left: inEvent.pageX + 20});
		this.setBounds({top: inEvent.pageY - 12, left: inEvent.pageX - 44});
		this.show();
	},
	*/
	showingChanged: function() {
		this.inherited(arguments);
		document.body.style.cursor = this.showing ? "move" : null;
	}
});

enyo.kind({
	name: "enyo.DragAvatar",
	published: {
		showing: false
	},
	kind: enyo.Component,
	initComponents: function() {
		this.avatarComponents = this.components;
		this.components = null;
		this.inherited(arguments);
	},
	requireAvatar: function() {
		// FIXME: there is nobody to call teardownRender on enyo.DragAvatar.avatar.
		// if document.body.innerHTML has been written over, his node is invalid so
		// we should have a trap for this condition here
		if (!this.avatar) {
			this.avatar = this.createComponent({kind: enyo._DragAvatar, parentNode: document.body, showing: false, components: this.avatarComponents}).render();
		}
	},
	drag: function(inEvent) {
		this.requireAvatar();
		//this.setBounds({top: inEvent.pageY - 50, left: inEvent.pageX + 20});
		//this.avatar.setBounds({top: inEvent.pageY - 50, left: inEvent.pageX - 84});
		this.avatar.setBounds({top: inEvent.pageY - 30, left: inEvent.pageX + 20});
		this.show();
	},
	show: function() {
		this.setShowing(true);
	},
	hide: function() {
		this.setShowing(false);
	},
	showingChanged: function() {
		this.avatar.setShowing(this.showing);
		document.body.style.cursor = this.showing ? "move" : null;
	}
});

