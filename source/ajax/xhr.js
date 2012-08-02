//* @protected
enyo.xhr = {
	/**
		<code>inParams</code> is an Object that may contain these properties:

		- _url_: The URL to request (required).
		- _method_: The HTTP method to use for the request. Defaults to GET.
		- _callback_: Called when request is completed.
		- _body_: Specific contents for the request body for POST method.
		- _headers_: Request headers.
		- _username_: The optional user name to use for authentication purposes.
		- _password_: The optional password to use for authentication purposes.
		- _xhrFields_: Optional object containing name/value pairs to mix directly into the generated xhr object.
		- _mimeType_: Optional string to override the MIME-Type.
	*/
	request: function(inParams) {
		var xhr = this.getXMLHttpRequest();
		//
		var method = inParams.method || "GET";
		var async = ("sync" in inParams) ? !inParams.sync : true;
		//
		if (inParams.username) {
			xhr.open(method, enyo.path.rewrite(inParams.url), async, inParams.username, inParams.password);
		} else {
			xhr.open(method, enyo.path.rewrite(inParams.url), async);
		}
		//
		enyo.mixin(xhr, inParams.xhrFields);
		//
		this.makeReadyStateHandler(xhr, inParams.callback);
		if (inParams.headers) {
			for (var key in inParams.headers) {
				xhr.setRequestHeader(key, inParams.headers[key]);
			}
		}
		//
		if(typeof(xhr.overrideMimeType) == "function" && inParams.mimeType) {
			xhr.overrideMimeType(inParams.mimeType);
		}
		//
		xhr.send(inParams.body || null);
		if (!async) {
			xhr.onreadystatechange(xhr);
		}
		return xhr;
	},
	//* @protected
	makeReadyStateHandler: function(inXhr, inCallback) {
		inXhr.onreadystatechange = function() {
			if (inXhr.readyState == 4) {
				inCallback && inCallback.apply(null, [inXhr.responseText, inXhr]);
			}
		};
	},
	getXMLHttpRequest: function() {
		try {
			return new XMLHttpRequest();
		} catch (e) {}
		try {
			return new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e) {}
		try {
			return new ActiveXObject('Microsoft.XMLHTTP');
		} catch (e) {}
		return null;
	}
};
