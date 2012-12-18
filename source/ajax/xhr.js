//* @protected
/**
	If you make changes to _enyo.xhr_, be sure to add or update the appropriate
	[unit tests](https://github.com/enyojs/enyo/tree/master/tools/test/ajax/tests).
*/
enyo.xhr = {
	/**
		<code>inParams</code> is an Object that may contain these properties:

		- _url_: The URL to request (required).
		- _method_: The HTTP method to use for the request. Defaults to GET.
		- _callback_: Called when request is completed. (Optional)
		- _body_: Specific contents for the request body for POST method. (Optional)
		- _headers_: Additional request headers. (Optional).  Given headers override the ones that Enyo may set by default (`null` explictly removing the header from the AJAX request).
		- _username_: The optional user name to use for authentication purposes.
		- _password_: The optional password to use for authentication purposes.
		- _xhrFields_: Optional object containing name/value pairs to mix directly into the generated xhr object.
		- _mimeType_: Optional string to override the MIME-Type.
	*/
	request: function(inParams) {
		var xhr = this.getXMLHttpRequest(inParams);
		var url = enyo.path.rewrite(this.simplifyFileURL(inParams.url));
		//
		var method = inParams.method || "GET";
		var async = !inParams.sync;
		//
		if (inParams.username) {
			xhr.open(method, url, async, inParams.username, inParams.password);
		} else {
			xhr.open(method, url, async);
		}
		//
		enyo.mixin(xhr, inParams.xhrFields);
		// only setup handler when we have a callback
		if (inParams.callback) {
			this.makeReadyStateHandler(xhr, inParams.callback);
		}
		//
		inParams.headers = inParams.headers || {};
		// work around iOS 6 bug where non-GET requests are cached
		// see http://www.einternals.com/blog/web-development/ios6-0-caching-ajax-post-requests
		// not sure (yet) wether this will be required for later ios releases
		if (method !== "GET" && enyo.platform.ios && enyo.platform.ios >= 6) {
			if (inParams.headers["cache-control"] !== null) {
				inParams.headers["cache-control"] = inParams.headers['cache-control'] || "no-cache";
			}
		}
		// user-set headers override any platform-default
		if (xhr.setRequestHeader) {
			for (var key in inParams.headers) {
				if (inParams.headers[key]) {
					xhr.setRequestHeader(key, inParams.headers[key]);
				}
			}
		}
		//
		if((typeof xhr.overrideMimeType == "function") && inParams.mimeType) {
			xhr.overrideMimeType(inParams.mimeType);
		}
		//
		xhr.send(inParams.body || null);
		if (!async && inParams.callback) {
			xhr.onreadystatechange(xhr);
		}
		return xhr;
	},
	//* remove any callbacks that might be set from Enyo code for an existing XHR
	//* and stop the XHR from completing.
	cancel: function(inXhr) {
		if (inXhr.onload) {
			inXhr.onload = null;
		}
		if (inXhr.onreadystatechange) {
			inXhr.onreadystatechange = null;
		}
		if (inXhr.abort) {
			inXhr.abort();
		}
	},
	//* @protected
	makeReadyStateHandler: function(inXhr, inCallback) {
		if (window.XDomainRequest && inXhr instanceof XDomainRequest) {
			inXhr.onload = function() {
				var text;
				if (typeof inXhr.responseText === "string") {
					text = inXhr.responseText;
				}
				inCallback.apply(null, [text, inXhr]);
			};
		}
		inXhr.onreadystatechange = function() {
			if (inXhr.readyState == 4) {
				var text;
				if (typeof inXhr.responseText === "string") {
					text = inXhr.responseText;
				}
				inCallback.apply(null, [text, inXhr]);
			}
		};
	},
	inOrigin: function(inUrl) {
		var a = document.createElement("a"), result = false;
		a.href = inUrl;
		// protocol is ":" for relative URLs
		if (a.protocol === ":" ||
				(a.protocol === window.location.protocol &&
					a.hostname === window.location.hostname &&
					a.port === (window.location.port ||
						(window.location.protocol === "https:" ? "443" : "80")))) {
			result = true;
		}
		return result;
	},
	simplifyFileURL: function(inUrl) {
		var a = document.createElement("a"), result = false;
		a.href = inUrl;
		// protocol is ":" for relative URLs
		if (a.protocol === "file:" ||
			a.protocol === ":" && window.location.protocol === "file:") {
			// leave off search and hash parts of the URL
			return a.protocol + '//' + a.host + a.pathname;
		} else {
			return inUrl;
		}
	},
	getXMLHttpRequest: function(inParams) {
		try {
			// only use XDomainRequest when it exists, no extra headers were set, and the
			// target URL maps to a domain other than the document origin.
			if (enyo.platform.ie < 10 && window.XDomainRequest && !inParams.headers &&
				!this.inOrigin(inParams.url) && !/^file:\/\//.test(window.location.href)) {
				return new XDomainRequest();
			}
		} catch(e) {}
		try {
			return new XMLHttpRequest();
		} catch(e) {}
		return null;
	}
};
