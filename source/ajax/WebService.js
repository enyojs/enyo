enyo.kind({
	name: "enyo.WebService",
	kind: enyo.Component,
	published: enyo.AjaxProperties,
	events: {
		onResponse: "",
		onError: ""
	},
	//* @protected
	constructor: function(inProps) {
		this.inherited(arguments);
	},
	//* @public
	send: function(inParams) {
		var ajax = new enyo.Ajax();
		// hardcore
		for (var n in enyo.AjaxProperties) {
			ajax[n] = this[n];
		}
		return ajax.go(inParams).response(this, "response").error(this, "error");
	},
	response: function(inSender, inData) {
		this.doResponse({ajax: inSender, data: inData});
	},
	error: function(inSender, inData) {
		this.doError({ajax: inSender, data: inData});
	}
});
