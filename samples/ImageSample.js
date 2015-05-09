enyo.kind({
	name: "enyo.sample.ImageSample",
	classes: "image-sample",
	components: [
		{content: "Image - No Sizing", classes: "section"},
		{kind: "enyo.Image", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{content: "Sizing - Contain", classes: "section"},
		{kind: "enyo.Image", style: "width:200px; height:100px; background-color:rgba(200,100,0,0.3); border: 1px dashed orange; margin-right: 1em;", sizing: "contain", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{kind: "enyo.Image", style: "width:200px; height:100px; background-color:rgba(0,200,0,0.3); border: 1px dashed green;", sizing: "contain", position: "left top", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{content: "Sizing - Cover", classes: "section"},
		{kind: "enyo.Image", style: "width:200px; height:100px; background-color:rgba(0,0,200,0.3); border: 1px dashed blue; margin-right: 1em;", sizing: "cover", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{kind: "enyo.Image", style: "width:200px; height:100px; background-color:rgba(200,200,0,0.3); border: 1px dashed yellow;", sizing: "cover", position: "left top", src: "http://enyojs.com/img/enyo-logo.png", alt: "Enyo Logo"},
		{content: "Placeholder Image", classes: "section"},
		{kind: "enyo.Image", src: enyo.Image.placeholder, alt: "Placeholder Image", classes: "placeholder"}
	]
});
