enyo.kind({
	name: "enyo.sample.Playground",
	kind: "Panels",
	classes: "enyo-fit onyx playground-sample-panels",
	arrangerKind:"CollapsingArranger",
	components: [
		{kind: "FittableRows", style:"width:50%;", components: [
			{kind: "onyx.Toolbar", name:"toolbar", layoutKind:"FittableColumnsLayout", components: [
				{content: "Enyo Playground", fit:true},
				{kind: "onyx.PickerDecorator", components: [
					{},
					{kind: "onyx.Picker", floating:true, onChange:"sampleChanged", components: [
						{content:"Sample1", active:true},
						{content:"Sample2"},
						{content:"Sample3"},
						{content:"Sample4"}
					]}
				]}
			]},
			{fit:true, style:"padding:15px;", components: [
				{kind: "CodeEditor", fit:true, classes:"playground-sample-source"},
			]},
			{kind: "FittableColumns", style:"margin:0px 15px 15px 15px", components: [
				{fit:true}, // spacer
				{kind: "onyx.Button", content: "Render Kind", ontap: "go"}
			]}
		]},
		{kind: "FittableRows", classes:"onyx", components: [
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Grabber"},
				{content: "Result"}
			]},
			{kind: "Scroller", fit:true, components: [
				{kind: "CodePlayer", fit:true, classes: "playground-sample-player"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
	},
	sampleChanged: function(inSender, inEvent) {
		this.loadSample(inEvent.selected.content);
		this.$.toolbar.resized();
	},
	loadSample: function(inSample) {
		this.$.codeEditor.setUrl("assets/" + inSample + ".js");
	},
	go: function() {
		this.$.codePlayer.go(this.$.codeEditor.getValue());
		if (enyo.Panels.isScreenNarrow()) {
			this.next();
		}
	}
});