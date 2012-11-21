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
	
	For more information, see the documentation on
	[Consuming Web Services](https://github.com/enyojs/enyo/wiki/Consuming-Web-Services)
	in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Ajax",
	kind: enyo.Async,
	//* See <a href="#enyo.AjaxProperties">enyo.AjaxProperties</a> for the list of properties
	//* published by _enyo.Ajax_.
	published: enyo.AjaxProperties,
	//* @protected
	constructor: function(inParams) {
		enyo.mixin(this, inParams);
		this.inherited(arguments);
	},
	//* @public
	/**
    Sends the Ajax request with parameters _inParams_. _inParams_ values may be
    either Strings or Objects.

    _inParams_ as an Object is converted into the url query string. For
    instance, passing <code>{q: "searchTerm"}</code> will result in the addition
    of the string `q="searchTerm"` to the current url query string.

    _inParams_ as a String is used as the request body, and triggers various
    behaviors depending on the query method.

    * The GET method, since it has no body, translates the string into a
        parameter. Thus `'q="searchTerm"'` translates into `q=searchTerm` in the
        url query string.

    * The POST method uses the provided string as its body. However, this will
        be overridden by the value of _postBody_, if set.

    The use of _inParams_ as a String is discouraged. Instead, set the request
    body content via _postBody_ and use _inParams_ as an Object to set the query
    string.

    When the request is completed, the code will set a `xhrResponse` property
    in the `enyo.Ajax` object with the subproperties `status`, `headers`, and
    `body`.  These cache the results from the XHR for later use.  The keys for
    the `headers` object have been converted to all lower case as HTTP headers
    are case-insensitive.
	*/
	go: function(inParams) {
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
        var body = null;
        //
        if(enyo.isString(inParams)){
            //If inParams parameter is a string, use it as request body
            body = inParams;
        }
        else{
            //If inParams parameter is not a string, build a query from it
            if(inParams){
                args.push(enyo.Ajax.objectToQuery(inParams));
            }
        }
        //
		if (this.method == "GET") {
			if (body) {
				args.push(body);
				body = null;
			}
			// don't use cacheBust on file URLs, can cause problems in Android 4
			if (this.cacheBust && !/^file:/i.test(uri)) {
				args.push(Math.random());
			}
		}
		//
		var url = args.length ? [uri, args.join("&")].join("?") : uri;
		//
		var xhr_headers = {};
		body = this.postBody || body;
		if (this.method != "GET") {
			if (this.method === "POST" && window.FormData && body instanceof FormData) {
				// Nothing to do as the content-type will be automagically set according to the FormData
			} else {
				xhr_headers["Content-Type"] = this.contentType;
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
				callback: enyo.bind(this, "receive"),
				body: body,
				headers: xhr_headers,
				sync: window.PalmSystem ? false : this.sync,
				username: this.username,
				password: this.password,
				xhrFields: this.xhrFields,
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
			var text;
			if (typeof inXhr.responseText === "string") {
				text = inXhr.responseText;
			}
			this.xhrResponse = {
				status: inXhr.status,
				headers: enyo.Ajax.parseResponseHeaders(inXhr),
				body: text
			};
			if (this.isFailure(inXhr)) {
				this.fail(inXhr.status);
			} else {
				this.respond(this.xhrToResponse(inXhr));
			}
		}
	},
	fail: function(inError) {
		// on failure, explicitly cancel the XHR to prevent
		// further responses.  cancellation also resets the
		// response headers & body, 
		if (this.xhr) {
			enyo.xhr.cancel(this.xhr);
			this.xhr = null;
		}
		this.inherited(arguments);
	},
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
		},
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
