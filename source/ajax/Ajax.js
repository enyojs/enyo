﻿/**
	_enyo.Ajax_ is a wrapper for _XmlHttpRequest_ that uses
	the <a href="#enyo.Async">enyo.Async</a> API.
	
	IMPORTANT: _enyo.Ajax_ publishes all the properties of the
	<a href="#enyo.AjaxProperties">enyo.AjaxProperties</a>
	object.

	Like _enyo.Async_, _enyo.Ajax_ is an **Object**, not a **Component**. 
	Do not try to make _enyo.Ajax_ objects inside a _components_ block.

	If you want to use _enyo.Ajax_ as a component, you should probably
	be using <a href="#enyo.WebService">enyo.WebService</a> instead.

	Example

		getWoeid: function(inPlace) {
			// setup <a href="#enyo.AjaxProperties">enyo.AjaxProperties</a> by sending them to the _enyo.Ajax_ constructor
			var x = enyo.Ajax({url: "http://query.yahooapis.com/v1/public/yql?format=json"});
			// send parameters the remote service using the 'go()' method
			x.go({
				q: 'select woeid from geo.placefinder where text="' + inPlace + '"'
			});
			// attach responders to the transaction object
			x.response(this, function(inSender, inResponse) {
				// extra information from response object
				var woeid = inResponse.data.query.results.Result.woeid;
				// do something with it
				this.setWoeid(inPlace, woeid);
			};
		}
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
		Sends the ajax request with parameters _inParams_.
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
		var args = parts.join("?").split("&");
		//
		var body = enyo.isString(inParams) ? inParams : enyo.Ajax.objectToQuery(inParams);
		if (this.method == "GET") {
			if (body) {
				args.push(body);
				body = null;
			}
			if (this.cacheBust) {
				args.push(Math.random());
			}
		}
		//
		var url = [uri, args.join("&")].join("?");
		//
		var xhr_headers = {
			"Content-Type": this.contentType
		};
		enyo.mixin(xhr_headers, this.headers);
		//
		this.xhr = enyo.xhr.request({
			url: url,
			method: this.method,
			callback: enyo.bind(this, "receive"),
			body: this.postBody || body,
			headers: xhr_headers,
			sync: window.PalmSystem ? false : this.sync,
			username: this.username,
			password: this.password,
			xhrFields: this.xhrFields
		});
	},
	receive: function(inText, inXhr) {
		if (!this.destroyed) {
			if (this.isFailure(inXhr)) {
				this.fail(inXhr.status);
			} else {
				this.respond(this.xhrToResponse(inXhr));
			}
		}
	},
	xhrToResponse: function(inXhr) {
		if (inXhr) {
			return this[(this.handleAs || "text") + "Handler"](inXhr);
		}
	},
	isFailure: function(inXhr) {
		// Usually we will treat status code 0 and 2xx as success.  But in webos, if url is a local file,
		// 200 is returned if the file exists, 0 otherwise.  So we workaround this by treating 0 differently if
		// the app running inside webos and the url is not http.
		//return ((!window.PalmSystem || this.isHttpUrl()) && !inStatus) || (inStatus >= 200 && inStatus < 300);
		return (inXhr.status !== 0) && (inXhr.status < 200 || inXhr.status >= 300);
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
			console.warn("Ajax request set to handleAs JSON but data was not in JSON format");
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
		}
	}
});
