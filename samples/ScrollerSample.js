enyo.kind({
	name: "enyo.sample.ScrollerSample",
	kind: "FittableRows",
	classes: "enyo-fit",
	components: [
		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.PickerDecorator", components: [
				{content:"Choose Scroller", style:"width:180px;"},
				{kind: "onyx.Picker", floating:true, onSelect:"sampleChanged", components: [
					{content:"Default scroller", active:true},
					{content:"Force touch scroller"},
					{content:"Horizontal only"},
					{content:"Vertical only"}
				]}
			]}
		]},
		{kind: "Panels", fit:true, classes: "scroller-sample-panels", components: [
			// Default scroller (chooses best scrolling method for platform)
			{kind: "Scroller", classes: "scroller-sample-scroller enyo-fit"},
			// Forces touch scrolling, even on desktop
			{kind: "Scroller", touch:true, classes: "scroller-sample-scroller enyo-fit"},
			// Horizontal-only scrolling
			{kind: "Scroller", vertical:"hidden", classes: "scroller-sample-scroller enyo-fit"},
			// Vertical-only scrolling
			{kind: "Scroller", horizontal:"hidden", classes: "scroller-sample-scroller enyo-fit"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		var scrollers = this.$.panels.getPanels();
		for (var i in scrollers) {
			scrollers[i].createComponent({
				allowHtml:true, 
				content:this.text,
				classes:"scroller-sample-content"
			});
		}
	},
	sampleChanged: function(inSender, inEvent) {
		this.$.panels.setIndex(inEvent.selected.indexInContainer()-1);
	},
	text: "Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br>Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br>Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br>Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br>"
});