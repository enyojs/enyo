enyo.kind({
	name: "enyo.sample.AjaxSample",
	kind: "FittableRows",
	classes: "enyo-fit ajax-sample",
	components: [
		{kind: "FittableColumns", classes:"onyx-toolbar-inline", components: [
			{content: "YQL: "},
			{kind: "onyx.Input", name:"query", fit:true, value:'select * from upcoming.events where woeid in (select woeid from geo.places where text="Sunnyvale, CA")'},
			{kind: "onyx.Button", content:"Fetch", ontap:"fetch"}
		]},
		{kind: "onyx.TextArea", fit:true, classes:"ajax-sample-source"}
	],
	fetch: function() {    
		var ajax = new enyo.Ajax({
			url: "http://query.yahooapis.com/v1/public/yql?format=json"
		});
		// send parameters the remote service using the 'go()' method
		ajax.go({
			q: this.$.query.getValue()
		});
		// attach responders to the transaction object
		ajax.response(this, "processResponse");
	},
	processResponse: function(inSender, inResponse) {
		// do something with it
		this.$.textArea.setValue(JSON.stringify(inResponse, null, 2));
	}
});