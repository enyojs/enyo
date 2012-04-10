/**
	A specialized form of enyo.Async that is used for making JSONP requests to a
	remote server. This differs from normal XmlHTTPRequest calls because the
	external resource is loaded using a <script> tag. This allows bypassing same-
	domain rules that normally apply to XHR since the browser will load scripts
	from any address.
*/
enyo.kind({
	name: "enyo.JsonpRequest",
	kind: enyo.Async,

	published: {
		//*	The URL for the service.
		url: "",
		/**
			name of the argument that holds the callback name. For example, the
			Twitter search API uses "callback" as the parameter to hold the
			name of the called function.  We will automatically add this to
			the encoded arguments.
		*/
		callbackName: "callback"
	},

	statics: {
		// counter to allow creating unique names for each JSONP request
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

	//* starts the JSONP request
	go: function(inParams) {
		this.startTimer();
		this.jsonp(inParams);
		return this;
	},

	//* @protected

	// for a string version of inParams, we follow the convention of
	// replacing the string "=?" with the callback name.  For the more
	// common case of inParams being an object, we'll add a argument named
	// using the callbackName published property.
	jsonp: function(inParams) {
		var callbackFunctionName = "enyo_jsonp_callback_" + (enyo.JsonpRequest.nextCallbackID++);
		//
		var parts = this.url.split("?");
		var uri = parts.shift() || "";
		var args = parts.join("?").split("&");
		//
		var body;
		if (enyo.isString(inParams)) {
			body = inParams.replace("=?", "=" + callbackFunctionName);
		}
		else {
			var params = enyo.mixin({}, inParams);
			params[this.callbackName] = callbackFunctionName;
			body = enyo.Ajax.objectToQuery(params);
		}
		args.push(body);
		//
		var url = [uri, args.join("&")].join("?");
		var script = enyo.JsonpRequest.addScriptElement(url);
		window[callbackFunctionName] = enyo.bind(this, this.respond);
		//
		// setup cleanup handlers for JSONP completion and failure
		var cleanup = function() {
			//enyo.JsonpRequest.removeElement(script);
			//window[callbackFunctionName] = null;
		};
		this.response(cleanup);
		this.error(cleanup);
	}
});