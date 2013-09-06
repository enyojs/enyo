enyo.kind({
	name: "enyo.sample.AjaxSample",
	kind: "FittableRows",
	classes: "enyo-fit ajax-sample",
	components: [
		{kind: "FittableColumns", classes:"onyx-toolbar-inline", components: [
			{content: "YQL: "},
			{kind: "onyx.Input", name:"query", fit:true, value:'select * from weather.forecast where woeid in (select woeid from geo.places where text="san francisco, ca")'},
			{kind: "onyx.Button", content:"Fetch", ontap:"fetch"}
		]},
		{kind: "FittableColumns", classes:"onyx-toolbar-inline", components: [
			{content: "URL: "},
			{kind: "onyx.Input", name:"baseUrl", fit:true, value:'http://query.yahooapis.com/v1/public/yql?format=json'}
		]},
		{kind: "onyx.TextArea", fit:true, classes:"ajax-sample-source"},
		{name: "basicPopup", kind: "onyx.Popup", centered: true, floating: true, classes:"onyx-sample-popup", style: "padding: 10px;", content: "Popup..."}
	],
	fetch: function() {
		var ajax = new enyo.Ajax({
			url: this.$.baseUrl.getValue()
		});
		// send parameters the remote service using the 'go()' method
		ajax.go({
			q: this.$.query.getValue()
		});
		// attach responders to the transaction object
		ajax.response(this, "processResponse");
		// handle error
		ajax.error(this, "processError");
	},
	processResponse: function(inSender, inResponse) {
		// do something with it
		this.$.textArea.setValue(JSON.stringify(inResponse, null, 2));
	},
	processError: function(inSender, inResponse) {
		var errorLog = "Error" + ": " + inResponse + "! " + (JSON.parse(inSender.xhrResponse.body)).error.description;
		this.$.textArea.setValue(JSON.stringify(inSender.xhrResponse, null, 2));
		this.$.basicPopup.setContent(errorLog);
		this.$.basicPopup.show();
	}
});