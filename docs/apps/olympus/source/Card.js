enyo.kind({
	name: "Card",
	kind: "Control",
	published: {
		url: "",
		minimized: false
	},
	events: {
		onMaximized: "cardMaximized",
		onMinimized: "cardMinimized",
		onTossed: "cardTossed"
	},
	components: [
		{name: "iframe", tagName: "iframe", className: "card-iframe"},
		{name: "scrim", className: "fit", ontap: "scrimTap"},
		{kind: "Animator", onAnimate: "animate", onEnd: "finishAnimate"},
	],
	create: function() {
		this.inherited(arguments);
		this.urlChanged();
		this.minimizedChanged();
	},
	urlChanged: function() {
		this.$.iframe.setAttribute("src", this.url);
	},
	launch: function() {
		this.setMinimized(false);
		this.setClassName("card-max-launch");
	},
	minimizedChanged: function() {
		if (this.minimized) {
			this.minify();
		} else {
			this.maxify();
		}
	},
	minify: function() {
		this.$.scrim.setShowing(true);
		this.setClassName("card-min");
		this.doMinimized();
	},
	maxify: function() {
		this.$.scrim.setShowing(false);
		this.setClassName("card-max");
		this.doMaximized();
	},
	scrimTap: function(inSender, inEvent) {
		if (this.preventTap) {
			this.preventTap = false;
			return;
		}
		this.setMinimized(false);
	},
	applyTransform: function(inTransform) {
		var s = this.node.style;
		s.webkitTransform = s.MozTransform = s.msTransform = s.transform = inTransform;
	},
	dragstartHandler: function(inSender, inEvent) {
		if (this.minimized && !inEvent.horizontal) {
			this.dragging = true;
			return true;
		}
		this.preventTap = true;
	},
	dragHandler: function(inSender, inEvent) {
		if (this.dragging && this.hasNode()) {
			this.applyTransform("translate(0, " + inEvent.dy + "px)");
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (!this.dragging) {
			return;
		}
		if (inEvent.dy < -50) {
			this.tossed = true;
			this.$.animator.setDuration(1000);
			this.$.animator.play(inEvent.dy, -800);
		} else {
			this.$.animator.setDuration(500);
			this.$.animator.play(inEvent.dy, 0);
		}
		this.dragging = false;
		inEvent.preventTap();
	},
	animate: function(inSender, inDy) {
		this.applyTransform("translate(0, " + inDy + "px)");
	},
	finishAnimate: function() {
		if (this.tossed) {
			this.doTossed();
		}
	}
});
