enyo.kind({
	name: "enyo.sample.WebServiceSample",
	kind: "FittableRows",
	classes: "enyo-fit webservice-sample",
	components: [
		{kind: "WebService", name:"yql", url: "http://query.yahooapis.com/v1/public/yql?format=json", onResponse:"processResponse", onError: "processError", callbackName: "callback"},
		{kind: "FittableColumns", classes:"onyx-toolbar-inline", components: [
			{content: "YQL: "},
			{kind: "onyx.Input", name:"query", fit:true, value:'select * from weather.forecast where woeid in (select woeid from geo.places where text="san francisco, ca")'},
			{kind: "onyx.PickerDecorator", components: [
				{content:"Choose Scroller", style:"width:100px;"},
				{kind: "onyx.Picker", floating:true, components: [
					{content:"AJAX", active:true},
					{content:"JSON-P"}
				]}
			]},
			{kind: "onyx.Button", content:"Fetch", ontap:"fetch"}
		]},
		{kind: "onyx.TextArea", fit:true, classes:"webservice-sample-source"},
		{name: "basicPopup", kind: "onyx.Popup", centered: true, floating: true, classes:"onyx-sample-popup", style: "padding: 10px;", content: "Popup..."}
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
	},
	processError: function(inSender, inEvent) {
		var errorLog = "Error" + ": " + inEvent.data + "! " + (JSON.parse(inEvent.ajax.xhrResponse.body)).error.description;
		this.$.textArea.setValue(JSON.stringify(inEvent.ajax.xhrResponse, null, 2));
		this.$.basicPopup.setContent(errorLog);
		this.$.basicPopup.show();
	}
});