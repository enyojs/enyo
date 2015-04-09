enyo.kind({
	name: "enyo.sample.ImageSample",
	classes: "image-sample",
	components: [
		{content: "Image", classes: "section"},
		{kind: "enyo.Image", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{content: "Background Image", classes: "section"},
		{kind: "enyo.Image", style: "width:200px;height:75px;", sizing: "constrain", position: "left top", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},	
		{content: "Image with background color", classes: "section"},
		{kind: "enyo.Image", backgroundColor: 'yellow', src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{content: "Background Image with background color", classes: "section"},
		{kind: "enyo.Image", backgroundColor: 'yellow', style: "width:200px;height:75px;", sizing: "constrain", position: "left top", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{content: "Placeholder Image", classes: "section"},
		{kind: "enyo.Image", src: enyo.Image.placeholder, alt: "Placeholder Image", classes: "placeholder"}
	]
});
