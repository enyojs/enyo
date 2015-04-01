enyo.kind({
	name: "enyo.sample.ImageSample",
	kind: "Scroller",
	horizontal: "hidden",
	classes: "image-sample",
	components: [
		{content: "Image", classes: "section"},
		{kind: "enyo.Image", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{content: "Sizing Constrain", classes: "section"},
		{kind: "enyo.Image", style: "width:200px;height:75px;background-color:gray", sizing: "constrain", position: "left top", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{content: "Sizing Cover", classes: "section"},
		{kind: "enyo.Image", style: "width:200px;height:75px;background-color:gray", sizing: "cover", position: "left top", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{content: "Only Placeholder Image", classes: "section"},
		{kind: "enyo.Image", placeholder: enyo.Image.placeholder, alt: "Placeholder Image", classes: "placeholder"},
		{content: "Placeholder and Src, Sizing Constrain", classes: "section"},
		{kind: "enyo.Image", src: "http://enyojs.com/img/enyo-logo.png", sizing: 'constrain', placeholder: enyo.Image.placeholder, alt: "Placeholder Image", classes: "placeholder"},
		{content: "Placeholder and Src, No Sizing", classes: "section"},
		{kind: "enyo.Image", src: "http://enyojs.com/img/enyo-logo.png", placeholder: enyo.Image.placeholder, alt: "Placeholder Image", classes: "placeholder"}
	]
});
