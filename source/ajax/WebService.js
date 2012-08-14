//* @protected
enyo.kind({
	name: "enyo._AjaxComponent",
	kind: enyo.Component,
	published: enyo.AjaxProperties
});

//* @public
/**
	_enyo.WebService_ is a component that performs Web requests (_XmlHttpRequest_).

	Internally, _enyo.WebService_ uses _enyo.Async_ subkinds (namely,
	<a href="#enyo.Ajax">enyo.Ajax</a> and
	<a href="#enyo.JsonpRequest">enyo.JsonpRequest</a>) to manage transactions.
	The Async instance for a request is returned from the _send_ method.

	IMPORTANT: _enyo.Ajax_ publishes all the properties of the
	<a href="#enyo.AjaxProperties">enyo.AjaxProperties</a> object.
*/
enyo.kind({
	name: "enyo.WebService",
	kind: enyo._AjaxComponent,
	published: {
		//* Set to true to use JSONP protocol.
		jsonp: false,
		/**
			When using JSONP, the name of the callback parameter.
			Note that this not the name of a callback function, but only
			the name of the callback parameter. Enyo will create an
			internal callback function as necessary.
		*/
		callbackName: "callback",
		//* When using JSONP, optional character set to use to interpret the return data
		charset: null
	},
	events: {
		/**
			Fires when a response is received. The _ajax_ property contains the
			associated Async instance, while the _data_ property contains the
			response data.
		*/
		onResponse: "",
		/**
			Fires when an error is received. The _ajax_ property contains the
			associated Async instance, while the _data_ property contains the
			error data.
		*/
		onError: ""
	},
	//* @protected
	constructor: function(inProps) {
		this.inherited(arguments);
	},
	//* @public
	//* Sends a Web request with the passed-in parameters, returning the
	//* associated Async instance.
	send: function(inParams) {
		return this.jsonp ? this.sendJsonp(inParams) : this.sendAjax(inParams);
	},
	//* @protected
	sendJsonp: function(inParams) {
		var jsonp = new enyo.JsonpRequest();
		for (var n in {'url':1, 'callbackName':1, 'charset':1}) {
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
