enyo.kind({
	name: "Flickr",
	kind: "Control",
	published: {
		src: ""
	},
	components: [
		{name: "image", tagName: "img", className: "fit center", style: "max-height: 100%;", onload: "imageLoaded", onerror: "imageLoaded"},
		{name: "spinner", kind: "SpinnerLarge", className: "fit center"}
	],
	create: function() {
		this.inherited(arguments);
		this.$.image.attributes.onload = enyo.bubbler;
		this.$.image.attributes.onerror = enyo.bubbler;
		this.$.spinner.setShowing(false);
		this.srcChanged();
	},
	srcChanged: function(inOld) {
		if (this.src != inOld) {
			this.$.spinner.setShowing(true);
			this.$.image.hasNode().src = this.src;
		}
	},
	imageLoaded: function() {
		this.$.spinner.setShowing(false);
	}
})
