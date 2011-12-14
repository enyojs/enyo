enyo.kind({
	name: "enyo.RotatingImage",
	kind: enyo.Control,
	className: "enyo-rotating-image",
	published: {
		//* Background image to rotate. Set to a falsy value to use a background-image supplied by a stylesheet.
		imageSrc: ""
	},
	stop: function() {
		this.removeClass("enyo-rotating-image");
	},
	start: function() {
		this.addClass("enyo-rotating-image");
	},
	//* @protected
	imageSrcChanged: function() {
		if (this.imageSrc) {
			this.applyStyle("background-image", "url(" + this.imageSrc + ")");
		} else {
			this.applyStyle("background-image", null);
		}
	},
	create: function() {
		this.inherited(arguments);
		this.imageSrcChanged()
	}
});
