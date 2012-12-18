/**
	_enyo.JsonpRequest_ is a specialized form of
	<a href="#enyo.Async">enyo.Async</a> used for making JSONP requests to a
	remote server. This differs from the normal	XmlHTTPRequest call in that the
	external resource is loaded using a	&lt;script&gt; tag. This allows us to
	bypass the same-domain rules that normally apply to XHR, since the browser
	will load scripts from any address.

	If you make changes to _enyo.JsonpRequest_, be sure to add or update the
	appropriate [unit tests](https://github.com/enyojs/enyo/tree/master/tools/test/ajax/tests).

	For more information, see the documentation on
	[Consuming Web Services](https://github.com/enyojs/enyo/wiki/Consuming-Web-Services)
	in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.JsonpRequest",
	kind: enyo.Async,
	published: {
		//* The URL for the service
		url: "",
		//* Optional character set to use to interpret the return data
		charset: null,
		/**
			Name of the argument that holds the callback name. For example, the
			Twitter search API uses "callback" as the parameter to hold the
			name of the called function.  We will automatically add this to
			the encoded arguments.
		*/
		callbackName: "callback",
		/**
			When true, appends a random number as a parameter for GET requests
			to try to force a new fetch of the resource instead of reusing a
			local cache
		*/
		cacheBust: true
	},
	statics: {
		// Counter to allow creation of unique name for each JSONP request
		nextCallbackID: 0
	},
	//* @protected
	addScriptElement: function() {
		var script = document.createElement('script');
		script.src = this.src;
		script.async = "async";
		if (this.charset) {
			script.charset = this.charset;
		}
		// most modern browsers also have an onerror handler
		script.onerror = enyo.bind(this, function() {
			// we don't get an error code, so we'll just use the generic 400 error status
			this.fail(400);
		});
		// add script before existing script to make sure it's in a valid part of document
		// http://www.jspatterns.com/the-ridiculous-case-of-adding-a-script-element/
		var first = document.getElementsByTagName('script')[0];
		first.parentNode.insertBefore(script, first);
		this.scriptTag = script;
	},
	removeScriptElement: function() {
		var script = this.scriptTag;
		this.scriptTag = null;
		script.onerror = null;
		if (script.parentNode) {
			script.parentNode.removeChild(script);
		}
	},
	constructor: function(inParams) {
		enyo.mixin(this, inParams);
		this.inherited(arguments);
	},
	//* @public
	//* Starts the JSONP request.
	go: function(inParams) {
		this.startTimer();
		this.jsonp(inParams);
		return this;
	},
	//* @protected
	jsonp: function(inParams) {
		var callbackFunctionName = "enyo_jsonp_callback_" + (enyo.JsonpRequest.nextCallbackID++);
		//
		this.src = this.buildUrl(inParams, callbackFunctionName);
		this.addScriptElement();
		//
		window[callbackFunctionName] = enyo.bind(this, this.respond);
		//
		// setup cleanup handlers for JSONP completion and failure
		var cleanup = enyo.bind(this, function() {
			this.removeScriptElement();
			window[callbackFunctionName] = null;
		});
		this.response(cleanup);
		this.error(cleanup);
	},
	buildUrl: function(inParams, inCallbackFunctionName) {
		var parts = this.url.split("?");
		var uri = parts.shift() || "";
		var args = parts.join("?").split("&");
		//
		var bodyArgs = this.bodyArgsFromParams(inParams, inCallbackFunctionName);
		args.push(bodyArgs);
		if (this.cacheBust) {
			args.push(Math.random());
		}
		//
		return [uri, args.join("&")].join("?");
	},
	// for a string version of inParams, we follow the convention of
	// replacing the string "=?" with the callback name. For the more
	// common case of inParams being an object, we'll add a argument named
	// using the callbackName published property.
	bodyArgsFromParams: function(inParams, inCallbackFunctionName) {
		if (enyo.isString(inParams)) {
			return inParams.replace("=?", "=" + inCallbackFunctionName);
		} else {
			var params = enyo.mixin({}, inParams);
			params[this.callbackName] = inCallbackFunctionName;
			return enyo.Ajax.objectToQuery(params);
		}
	}
});