/**
A basic drawer control that animates vertically to open and close.
The drawer may be opened by calling setOpen(true) or just open; it 
may be closed by calling setOpen(false) or just close. For example,

	{kind: "Drawer", components: [
		{content: "Now you see me now you don't"},
		{kind: "Button", content: "Close drawer", onclick: "closeDrawer"}
	]}

Then, to close the drawer:

	closeDrawer: function(inSender) {
		this.$.drawer.close();
	}

*/
enyo.kind({
	name: "enyo.BasicDrawer",
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
		dimension: "height",
		peek: null
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
		{name: "client"}
	],
	className: "enyo-drawer",
	create: function(inProps) {
		this.inherited(arguments);
		this.clientClassNameChanged();
		this.dimensionChanged();
		this.openChanged();
	},
	layoutKindChanged: function() {
		this.$.client.setLayoutKind(this.layoutKind);
	},
	dimensionChanged: function() {
		this.domDimension = "offset" + enyo.cap(this.dimension);
	},
	clientClassNameChanged: function(inOldClassName) {
		if (inOldClassName) {
			this.$.client.removeClass(inOldClassName);
		}
		this.$.client.addClass(this.clientClassName);
	},
	openChanged: function(inOldValue) {
		if (!this.canChangeOpen) {
			this.open = inOldValue;
			return;
		}
		if (this.hasNode()) {
			this.node.style.display = "";
		} else {
			this.applyStyle("display", "");
		}
		// animate opening!
		if (this.animate && this.hasNode()) {
			this.playAnimation();
		} else {
			this.applyStyle(this.dimension, this.open ? "auto" : this.getClosedSize() + "px");
			this.applyStyle("display", this.open ? null : this.getClosedDisplay());
		}
		if (inOldValue !== undefined && this.open !== inOldValue) {
			this.doOpenChanged();
		}
	},
	// NOTE: when animating closed, we ask dom for current content height
	getOpenedSize: function() {
		return this.$.client.hasNode()[this.domDimension];
	},
	getClosedSize: function() {
		return this.peek || 0;
	},
	getClosedDisplay: function() {
		return this.peek ? null : "none";
	},
	playAnimation: function() {
		if (this.hasNode()) {
			var a = this.node.animation;
			if (a) {
				a.stop();
			}
			//
			var s = this.node[this.domDimension];
			var e = this.open ? this.getOpenedSize() : this.getClosedSize();
			//
			// note: set correct control styles for end animation
			var ds = this.domStyles;
			ds[this.dimension] = e + "px";
			ds.display = this.open ? null : this.getClosedDisplay();
			// NOTE: need to instruct animation not prevent animating if drawer is hidden,
			// because since the drawer hides itself, it would never unhide in this case.
			a = this.createComponent({kind: "Animator", onAnimate: "stepAnimation", onStop: "stopAnimation", node: this.node, style: this.node.style, open: this.open, s: s, e: e, alwaysAnimate: true});
			a.duration = this.open ? 250 : 100;
			a.play(s, e);
			this.node.animation = a;
		}
	},
	stepAnimation: function(inSender, inValue) {
		inSender.style[this.dimension] = Math.round(inValue) + "px";
	},
	stopAnimation: function(inSender) {
		inSender.style[this.dimension] = inSender.open ? "auto" : this.getClosedSize() + "px";
		inSender.style.display = inSender.open ? null : this.getClosedDisplay();
		inSender.node.animation = null;
		inSender.destroy();
		this.doOpenAnimationComplete();
	},
	toggleOpen: function() {
		this.setOpen(!this.open);
	}
});

