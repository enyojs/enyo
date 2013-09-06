enyo.kind({
	name: "enyo.sample.JsonpSample",
	kind: "FittableRows",
	classes: "enyo-fit jsonp-sample",
	components: [
		{kind: "FittableColumns", classes:"onyx-toolbar-inline", components: [
			{content: "YQL: "},
			{kind: "onyx.Input", name:"query", fit:true, value:'select * from weather.forecast where woeid in (select woeid from geo.places where text="san francisco, ca")'},
			{kind: "onyx.Button", content:"Fetch", ontap:"fetch"}
		]},
		{kind: "onyx.TextArea", fit:true, classes:"jsonp-sample-source"}
	],
	fetch: function() {
		var jsonp = new enyo.JsonpRequest({
			url: "http://query.yahooapis.com/v1/public/yql?format=json",
			callbackName: "callback"
		});
		// send parameters the remote service using the 'go()' method
		jsonp.go({
			q: this.$.query.getValue()
		});
		// attach responders to the transaction object
		jsonp.response(this, "processResponse");
	},
	processResponse: function(inSender, inResponse) {
		// do something with it
		this.$.textArea.setValue(JSON.stringify(inResponse, null, 2));
	}
});
