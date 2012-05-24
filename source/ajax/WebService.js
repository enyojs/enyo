//* @protected
enyo.kind({
	name: "enyo._AjaxComponent",
	kind: enyo.Component,
	published: enyo.AjaxProperties
});

//* @public
/**
	_enyo.WebService_ is a Component that performs web requests (_XmlHttpRequest_).

	Interally, _enyo.WebService_ uses _enyo.Async_ subkinds (namely, _enyo.Ajax_ 
	and _enyo.JsonPRequest_) to manage transactions. The async instance for
	a request is returned from the _send()_ method.

	IMPORTANT: _enyo.Ajax_ publishes all the properties of the
	<a href="#enyo.AjaxProperties">enyo.AjaxProperties</a>
	object.
*/
enyo.kind({
	name: "enyo.WebService",
	kind: enyo._AjaxComponent,
	published: {
		//* Set true to use JSONP protocol.
		jsonp: false,
		/**
			When using JSONP, the name of the callback parameter.
			Note: this not the name of a callback function, but only
			the name of the callback parameter. Enyo will create an
			internal callback function as necessary.
		*/
		callback: "callback",
		//* When using JSONP, optional character set to use to interpret the return data
		charset: null
	},
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
		return this.jsonp ? this.sendJsonp(inParams) : this.sendAjax(inParams);
	},
	//* @protected
	sendJsonp: function(inParams) {
		var jsonp = new enyo.JsonpRequest();
		for (var n in {'url':1, 'callback':1, 'charset':1}) {
			jsonp[n] = this[n];
		}
		return this.sendAsync(jsonp, inParams);
	},
	sendAjax: function(inParams) {
		var ajax = new enyo.Ajax();
		for (var n in enyo.AjaxProperties) {
			ajax[n] = this[n];
		}
		return this.sendAsync(ajax, inParams);
	},
	sendAsync: function(inAjax, inParams) {
		return inAjax.go(inParams).response(this, "response").error(this, "error");
	},
	response: function(inSender, inData) {
		this.doResponse({ajax: inSender, data: inData});
	},
	error: function(inSender, inData) {
		this.doError({ajax: inSender, data: inData});
	}
});
