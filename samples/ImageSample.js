enyo.kind({
	name: "enyo.sample.ImageSample",
	classes: "image-sample",
	components: [
		{content: "Image", classes: "section"},
		{kind: "enyo.Image", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{kind: "enyo.Input", name: "inputSrc", type: "text", placeholder: "Image URL"},
		{kind: "enyo.Input", name: "inputAlt", type: "text", placeholder: "Image Alt Text"},
		{content: "Placeholder Image", classes: "section"},
		{kind: "enyo.Image", src: enyo.Image.placeholder, alt: "Placeholder Image", classes: "placeholder"}
	],
	bindings: [
		{from: ".$.image.src", to: ".$.inputSrc.value", oneWay: false},
		{from: ".$.image.alt", to: ".$.inputAlt.value", oneWay: false}
	]
});
