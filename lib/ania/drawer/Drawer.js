/**
A drawer control with a label, which animates vertically to open and close.
The drawer may be opened by calling setOpen(true) or just open; it 
may be closed by calling setOpen(false) or just close. For example,

	{kind: "Drawer", content: "Drawer", components: [
		{content: "Now you see me now you don't"},
		{kind: "Button", content: "Close drawer", onclick: "closeDrawer"}
	]}

Then, to close the drawer:

	closeDrawer: function(inSender) {
		this.$.drawer.close();
	}

*/
enyo.kind({
	name: "enyo.Drawer",
	kind: enyo.Control,
	published: {
		/**
		Specifies whether the drawer should be open.
		*/
		open: true,
		/**
		Controls whether or not the value of the open property may be changed.
		*/
		canChangeOpen: true,
		/**
		Set to false to avoid animations when the open state of a drawer changes.
		*/
		animate: true,
		/**
		CSS class to apply to the drawer content.
		*/
		contentClassName: "",
		/**
		Caption to display above drawer content.
		*/
		content: ""
	},
	events: {
		/**
		Event that fires when a drawer opens or closes.
		*/
		onOpenChanged: "",
		/**
		Event that fires when a drawer animation completes.
		*/
		onOpenAnimationComplete: ""
	},
	//* @protected
	components: [
		{name: "content", kind: enyo.Control, onclick: "toggleOpen"},
		{name: "client", kind: enyo.BasicDrawer, onOpenChanged: "doOpenChanged", onOpenAnimationComplete: "doOpenAnimationComplete"}
	],
	create: function(inProps) {
		this.inherited(arguments);
		this.contentClassNameChanged();
		this.canChangeOpenChanged();
		this.animateChanged();
		this.openChanged();
	},
	initComponents: function() {
		this.inherited(arguments);
		this.contentContainer = this.$.content;
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
		// NOTE: content is displayed only if one is provided
		this.contentContainer.applyStyle("display", this.content ? "block" : "none");
	},
	contentClassNameChanged: function(inOldClassName) {
		if (inOldClassName) {
			this.$.content.removeClass(inOldClassName);
		}
		this.$.content.addClass(this.contentClassName);
	},
	openChanged: function(inOldValue) {
		if (this.canChangeOpen) {
			this.$.client.setOpen(this.open);
		} else {
			this.open = inOldValue;
		}
	},
	canChangeOpenChanged: function() {
		this.$.client.setCanChangeOpen(this.canChangeOpen);
	},
	animateChanged: function() {
		this.$.client.setAnimate(this.animate);
	},
	//* @public
	/**
	Convenience method to open a drawer; equivalent to setOpen(true).
	*/
	open: function() {
		this.setOpen(true);
	},
	/**
	Convenience method to close a drawer; equivalent to setOpen(false).
	*/
	close: function() {
		this.setOpen(false);
	},
	/**
	Toggles the open state of the drawer.
	*/
	toggleOpen: function() {
		this.setOpen(!this.open);
	}
});