/**
	_enyo.Ajax_ is a wrapper for _XmlHttpRequest_ that uses
	the <a href="#enyo.Async">enyo.Async</a> API.

	_enyo.Ajax_ publishes all the properties of the
	<a href="#enyo.AjaxProperties">enyo.AjaxProperties</a>
	object.

	Like _enyo.Async_, _enyo.Ajax_ is an **Object**, not a **Component**.
	Do not try to make _enyo.Ajax_ objects inside a _components_ block.
	If you want to use _enyo.Ajax_ as a component, you should probably
	be using <a href="#enyo.WebService">enyo.WebService</a> instead.

	If you make changes to _enyo.Ajax_, be sure to add or update the appropriate
	[unit tests](https://github.com/enyojs/enyo/tree/master/tools/test/ajax/tests).

	For more information, see the documentation on [Consuming Web
	Services](building-apps/managing-data/consuming-web-services.html) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.Ajax",
	kind: "enyo.Async",
	//* See <a href="#enyo.AjaxProperties">enyo.AjaxProperties</a> for the list of properties
	//* published by _enyo.Ajax_.
	published: enyo.AjaxProperties,
	//* @protected
	constructor: enyo.inherit(function (sup) {
		return function(inParams) {
			enyo.mixin(this, inParams);
			sup.apply(this, arguments);
		};
	}),
	destroy: enyo.inherit(function (sup) {
		return function() {
			// explicilty release any XHR refs
			this.xhr = null;
			sup.apply(this, arguments);
		};
	}),
	//* @public
	/**
	Sends the Ajax request with parameters _inParams_. _inParams_ values may be
	either Strings or Objects.

	_inParams_ as an Object is converted into the url query string. For
	instance, passing _{q: "searchTerm"}_ will result in the addition
	of the string _q="searchTerm"_ to the current url query string.

	_inParams_ as a String is used as the query part of the URL directly.

	_inParams_ will not be converted into a POST body, it will always be used as
	part of the URL query string if provided.  Use the _postBody_ property for
	specifying a body.

	When the request is completed, the code will set an _xhrResponse_ property
	on the _enyo.Ajax_ object with the subproperties _status_, _headers_, and
	_body_.  These cache the results from the XHR for later use.  The keys for
	the _headers_ object are converted to all lowercase, as HTTP headers are
	case-insensitive.
	*/
	go: function(inParams) {
		this.failed = false;
		this.startTimer();
		this.request(inParams);
		return this;
	},
	//* @protected
	request: function(inParams) {
		var parts = this.url.split("?");
		var uri = parts.shift() || "";
		var args = parts.length ? (parts.join("?").split("&")) : [];
		//
		var query = null;
		//
		if(enyo.isString(inParams)){
			//If inParams parameter is a string, use it as request body
			query = inParams;
		}
		else{
			//If inParams parameter is not a string, build a query from it
			if(inParams){
				query = enyo.Ajax.objectToQuery(inParams);
			}
		}
		//
		if (query) {
			args.push(query);
			query = null;
		}
		if (this.cacheBust) {
			args.push(Math.random());
		}
		//
		var url = args.length ? [uri, args.join("&")].join("?") : uri;
		//
		var xhr_headers = {};
		var body;
		if (this.method != "GET") {
			body = this.postBody;
			if (this.method === "POST" && body instanceof enyo.FormData) {
				if (body.fake) {
					xhr_headers["Content-Type"] = body.getContentType();
					body = body.toString();
				} else {
					// Nothing to do as the
					// content-type will be
					// automagically set according
					// to the FormData
				}
			} else {
				xhr_headers["Content-Type"] = this.contentType;
				if (body instanceof Object) {
					if (this.contentType.match(/^application\/json(;.*)?$/) !== null) {
						body = JSON.stringify(body);
					} else if (this.contentType === "application/x-www-form-urlencoded") {
						body = enyo.Ajax.objectToQuery(body);
					}
					else {
						body = body.toString();
					}
				}
			}
		}
		enyo.mixin(xhr_headers, this.headers);
		// don't pass in headers structure if there are no headers defined as this messes
		// up CORS code for IE8-9
		if (enyo.keys(xhr_headers).length === 0) {
			xhr_headers = undefined;
		}
		//
		try {
			this.xhr = enyo.xhr.request({
				url: url,
				method: this.method,
				callback: this.bindSafely("receive"),
				body: body,
				headers: xhr_headers,
				sync: this.sync,
				username: this.username,
				password: this.password,
				xhrFields: enyo.mixin({onprogress: this.bindSafely(this.updateProgress)}, this.xhrFields),
				mimeType: this.mimeType
			});
		}
		catch (e) {
			// IE can throw errors here if the XHR would fail CORS checks,
			// so catch and turn into a failure.
			this.fail(e);
		}
	},
	receive: function(inText, inXhr) {
		if (!this.failed && !this.destroyed) {
			var body;
			if (typeof inXhr.responseText === "string") {
				body = inXhr.responseText;
			} else {
				// IE carrying a binary
				body = inXhr.responseBody;
			}
			this.xhrResponse = {
				status: inXhr.status,
				headers: enyo.Ajax.parseResponseHeaders(inXhr),
				body: body
			};
			if (this.isFailure(inXhr)) {
				this.fail(inXhr.status);
			} else {
				this.respond(this.xhrToResponse(inXhr));
			}
		}
	},
	fail: enyo.inherit(function (sup) {
		return function(inError) {
			// on failure, explicitly cancel the XHR to prevent
			// further responses.  cancellation also resets the
			// response headers & body,
			if (this.xhr) {
				enyo.xhr.cancel(this.xhr);
				this.xhr = null;
			}
			sup.apply(this, arguments);
		};
	}),
	xhrToResponse: function(inXhr) {
		if (inXhr) {
			return this[(this.handleAs || "text") + "Handler"](inXhr);
		}
	},
	isFailure: function(inXhr) {
		// if any exceptions are thrown while checking fields in the xhr,
		// assume a failure.
		try {
			var text = "";
			// work around IE8-9 bug where accessing responseText will thrown error
			// for binary requests.
			if (typeof inXhr.responseText === "string") {
				text = inXhr.responseText;
			}
			// Follow same failure policy as jQuery's Ajax code
			// CORS failures on FireFox will have status 0 and no responseText,
			// so treat that as failure.
			if (inXhr.status === 0 && text === "") {
				return true;
			}
			// Otherwise, status 0 may be good for local file access.  We treat the range
			// 1-199 and 300+ as failure (only 200-series code are OK).
			return (inXhr.status !== 0) && (inXhr.status < 200 || inXhr.status >= 300);
		}
		catch (e) {
			return true;
		}
	},
	xmlHandler: function(inXhr) {
		return inXhr.responseXML;
	},
	textHandler: function(inXhr) {
		return inXhr.responseText;
	},
	jsonHandler: function(inXhr) {
		var r = inXhr.responseText;
		try {
			return r && enyo.json.parse(r);
		} catch (x) {
			enyo.warn("Ajax request set to handleAs JSON but data was not in JSON format");
			return r;
		}
	},
	//* @protected
	//* Handler for ajax progress events.
	updateProgress: function(event) {
		// filter out "input" as it causes exceptions on some Firefox versions
		// due to unimplemented internal APIs
		var ev = {};
		for (var k in event) {
			if (k !== 'input') {
				ev[k] = event[k];
			}
		}
		this.sendProgress(event.loaded, 0, event.total, ev);
	},
	statics: {
		objectToQuery: function(/*Object*/ map) {
			var enc = encodeURIComponent;
			var pairs = [];
			var backstop = {};
			for (var name in map){
				var value = map[name];
				if (value != backstop[name]) {
					var assign = enc(name) + "=";
					if (enyo.isArray(value)) {
						for (var i=0; i < value.length; i++) {
							pairs.push(assign + enc(value[i]));
						}
					} else {
						pairs.push(assign + enc(value));
					}
				}
			}
			return pairs.join("&");
		}
	},
	protectedStatics: {
		parseResponseHeaders: function(xhr) {
			var headers = {};
			var headersStr = [];
			if (xhr.getAllResponseHeaders) {
				headersStr = xhr.getAllResponseHeaders().split(/\r?\n/);
			}
			for (var i = 0; i < headersStr.length; i++) {
				var headerStr = headersStr[i];
				var index = headerStr.indexOf(': ');
				if (index > 0) {
					var key = headerStr.substring(0, index).toLowerCase();
					var val = headerStr.substring(index + 2);
					headers[key] = val;
				}
			}
			return headers;
		}
	}
});
