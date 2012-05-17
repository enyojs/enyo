/**
	A specialized form of enyo.Async used for making JSONP requests to a remote
	server. This differs from the normal XmlHTTPRequest call in that the external
	resource is loaded using a &lt;script&gt; tag. This allows us to bypass the
	same-domain rules that normally apply to XHR, since the browser will load
	scripts	from any address.
*/
enyo.kind({
	name: "enyo.JsonpRequest",
	kind: enyo.Async,
	published: {
		//*	The URL for the service.
		url: "",
		/**
			Name of the argument that holds the callback name. For example, the
			Twitter search API uses "callback" as the parameter to hold the
			name of the called function.  We will automatically add this to
			the encoded arguments.
		*/
		callbackName: "callback"
	},
	statics: {
		// Counter to allow creation of unique name for each JSONP request
		nextCallbackID: 0,
		// For the tested logic around adding a <script> tag at runtime, see the
		// discussion at the URL below: 
		// http://www.jspatterns.com/the-ridiculous-case-of-adding-a-script-element/
		addScriptElement: function(src) {
			var script = document.createElement('script');
			script.src = src;
			var first = document.getElementsByTagName('script')[0];
			first.parentNode.insertBefore(script, first);
			return script;
		},
		removeElement: function(elem) {
			elem.parentNode.removeChild(elem);
		}
	},
	//* @protected
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
		var url = this.buildUrl(inParams, callbackFunctionName);
		var script = enyo.JsonpRequest.addScriptElement(url);
		//
		window[callbackFunctionName] = enyo.bind(this, this.respond);
		//
		// setup cleanup handlers for JSONP completion and failure
		var cleanup = function() {
			enyo.JsonpRequest.removeElement(script);
			window[callbackFunctionName] = null;
		};
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