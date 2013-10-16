//* @protected
enyo.kind({
	name: "enyo._AjaxComponent",
	kind: "enyo.Component",
	published: enyo.AjaxProperties
});

//* @public
/**
	_enyo.WebService_ is a component that performs Web requests (_XmlHttpRequest_).

	Internally, _enyo.WebService_ uses [enyo.Async](#enyo.Async) subkinds (namely,
	[enyo.Ajax](#enyo.Ajax) and	[enyo.JsonpRequest](#enyo.JsonpRequest) to manage
	transactions.	The _send()_ method returns the Async instance used by the
	request.

	_enyo.WebService_ uses _enyo.Ajax_ by default and, like _enyo.Ajax_, it
	publishes all the properties of the	[enyo.AjaxProperties](#enyo.AjaxProperties)
	object.

	To use _enyo.JsonpRequest_ instead of _enyo.Ajax_, set _jsonp_ to _true_.

	If you make changes to _enyo.WebService_, be sure to add or update the
	appropriate [unit tests](https://github.com/enyojs/enyo/tree/master/tools/test/ajax/tests).

	For more information, see the documentation on [Consuming Web
	Services](building-apps/managing-data/consuming-web-services.html) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.WebService",
	kind: "enyo._AjaxComponent",
	published: {
		//* Set to true to use JSONP protocol
		jsonp: false,
		/**
			When using JSONP, the name of the callback parameter.
			Note that this not the name of a callback function, but only
			the name of the callback parameter. Enyo will create an
			internal callback function as necessary.
		*/
		callbackName: "callback",
		/**
			When using JSONP, optional character set to use to interpret the
			return data
		*/
		charset: null,
		/**
			If set to a non-zero value, the number of milliseconds to
			wait after the _send_ call before failing with a "timeout" error
		*/
		timeout: 0
	},
	events: {
		/**
			Fires when a response is received.

			_inEvent.ajax_ contains the Async instance associated with the request.

			_inEvent.data_ contains the response data.
		*/
		onResponse: "",
		/**
			Fires when an error is received.

			_inEvent.ajax_ contains the	Async instance associated with the request.

			_inEvent.data_ contains the error data.
		*/
		onError: "",
		/**
			Fires when the request progresses.
		*/
		onProgress: ""
	},
	//* @public
	/**
		Sends a Web request with the passed-in parameters, returning the
		associated Async instance.

		_inProps_ is an optional object parameterthat  can be used to override some
		of the AJAX properties for this request, such as setting a _postBody_.
	*/
	send: function(inParams, inProps) {
		return this.jsonp ? this.sendJsonp(inParams, inProps) : this.sendAjax(inParams, inProps);
	},
	//* @protected
	sendJsonp: function(inParams, inProps) {
		var jsonp = new enyo.JsonpRequest();
		for (var n in {'url':1, 'callbackName':1, 'charset':1, 'timeout':1}) {
			jsonp[n] = this[n];
		}
		enyo.mixin(jsonp, inProps);
		return this.sendAsync(jsonp, inParams);
	},
	sendAjax: function(inParams, inProps) {
		var ajax = new enyo.Ajax(inProps);
		for (var n in enyo.AjaxProperties) {
			ajax[n] = this[n];
		}
		ajax.timeout = this.timeout;
		enyo.mixin(ajax, inProps);
		return this.sendAsync(ajax, inParams);
	},
	sendAsync: function(inAjax, inParams) {
		return inAjax.go(inParams).response(this, "response").error(this, "error").progress(this, "progress");
	},
	response: function(inSender, inData) {
		this.doResponse({ajax: inSender, data: inData});
	},
	error: function(inSender, inData) {
		this.doError({ajax: inSender, data: inData});
	},
	progress: function(inSender, inProgressEvent) {
		this.doProgress(inProgressEvent);
	}
});
