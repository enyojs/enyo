/**
An image control displays an image specified via the src property.
The src can be an absolute or relative url. It can also be a path
relative to any loaded enyo package.

For example:

	{kind: "Image", src: "http://www.example.com/image.jpg"},
	{kind: "Image", src: "images/image.jpg"},
	{kind: "Image", src: "$enyo-Heritage/images/popup-heritage.png"}

To change the image, use setSrc as follows:

	buttonClick: function() {
		this.$.image.setSrc("images/image2.jpg");
	}
*/
enyo.kind({
	name: "enyo.Image", 
	kind: enyo.Control,
	published: {
		src: "$ui/theme/default/images/blank.gif"
	},
	//* @protected
	tagName: "img",
	create: function() {
		this.inherited(arguments);
		enyo.mixin(this.attributes, {
			onerror: enyo.bubbler,
			draggable: false
		});
		if (this.onload) {
			this.attributes.onload = enyo.bubbler;
		}
		this.srcChanged();
	},
	srcChanged: function() {
		this.setAttribute("src", enyo.path.rewrite(this.src));
	},
	renderDomContent: function() {
		// No-op... <img> cannot contain any DOM content.
	}
});