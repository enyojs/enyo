enyo.kind({
	name: "enyo.sample.WebServiceSample",
	kind: "FittableRows",
	classes: "enyo-fit webservice-sample",
	components: [
		{kind: "WebService", name:"yql", url: "http://query.yahooapis.com/v1/public/yql?format=json", onResponse:"processResponse", callbackName: "callback"},
		{kind: "FittableColumns", classes:"onyx-toolbar-inline", components: [
			{content: "YQL: "},
			{kind: "onyx.Input", name:"query", fit:true, value:'select * from upcoming.events where woeid in (select woeid from geo.places where text="Sunnyvale, CA")'},
			{kind: "onyx.PickerDecorator", components: [
				{content:"Choose Scroller", style:"width:100px;"},
				{kind: "onyx.Picker", floating:true, components: [
					{content:"AJAX", active:true},
					{content:"JSON-P"}
				]}
			]},
			{kind: "onyx.Button", content:"Fetch", ontap:"fetch"}
		]},
		{kind: "onyx.TextArea", fit:true, classes:"webservice-sample-source"}
	],
	fetch: function() {    
		// send parameters the remote service using the 'send()' method
		this.$.yql.send({
			q: this.$.query.getValue(),
			jsonp: (this.$.picker.getSelected().indexInContainer()==2)
		});
	},
	processResponse: function(inSender, inEvent) {
		// do something with it
		this.$.textArea.setValue(JSON.stringify(inEvent.data, null, 2));
	}
});