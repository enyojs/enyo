enyo.kind({
	name: "enyo.sample.ScrollerSample",
	kind: "FittableRows",
	classes: "enyo-fit  enyo-unselectable",
	components: [
		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.PickerDecorator", components: [
				{content:"Choose Scroller", style:"width:250px;"},
				{kind: "onyx.Picker", floating:true, maxHeight: 300, onSelect:"sampleChanged", components: [
					{content:"Default scroller", active:true},
					{content:"Force touch scroller"},
					{content:"Horizontal only"},
					{content:"Vertical only"},
					{content:"Force TouchScrollStrategy"},
					{content:"Force TransitionScrollStrategy"},
					{content:"Force TranslateScrollStrategy"}
				]}
			]}
		]},
		{kind: "Panels", fit: true, draggable: false, classes: "scroller-sample-panels", components: [
			// Default scroller (chooses best scrolling method for platform)
			{kind: "Scroller", classes: "scroller-sample-scroller enyo-fit"},
			// Forces touch scrolling, even on desktop
			{kind: "Scroller", touch:true, classes: "scroller-sample-scroller enyo-fit"},
			// Horizontal-only scrolling
			{kind: "Scroller", vertical:"hidden", classes: "scroller-sample-scroller enyo-fit"},
			// Vertical-only scrolling
			{kind: "Scroller", horizontal:"hidden", classes: "scroller-sample-scroller enyo-fit", onmousedown: "mouseDown", ondragstart: "dragStart"},
			// Force specific strategies
			{kind: "Scroller", classes: "scroller-sample-scroller enyo-fit", strategyKind: "TouchScrollStrategy"},
			{kind: "Scroller", classes: "scroller-sample-scroller enyo-fit", strategyKind: "TransitionScrollStrategy"},
			{kind: "Scroller", classes: "scroller-sample-scroller enyo-fit", strategyKind: "TranslateScrollStrategy"}
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
	text: "Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>" +
		"Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br>Foo<br>Bar<br>Bar<br>" +
		"Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>" +
		"Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. <br>Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>" +
		"Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>" +
		"Foo<br>Bar<br>Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. " +
		"Boom boom pow. <br>Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>" +
		"Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. " +
		"Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br>",
	// The following are used when this sample is called from the Sampler app
	mouseDown: function(inSender, inEvent) {
		inEvent.preventDefault();
	},
	dragStart: function(inSender, inEvent) {
		if (inEvent.horizontal) {
			// Prevent drag propagation on horizontal drag events
			return true;
		}
	}
});