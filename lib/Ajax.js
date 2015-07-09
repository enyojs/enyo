require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Ajax~Ajax} kind.
* @module enyo/Ajax
*/

var
	kind = require('./kind'),
	utils = require('./utils'),
	json = require('./json'),
	logger = require('./logger');

var
	AjaxProperties = require('./AjaxProperties'),
	Async = require('./Async'),
	/*jshint -W079*/
	// this defaults to providing the native FormData if it exists
	FormData = require('./FormData'),
	/*jshint +W079*/
	Xhr = require('./xhr');
	

/**
* A cache of response properties set on the {@link module:enyo/Ajax~Ajax} instance once it has completed
* its request.
*
* @typedef {Object} module:enyo/Ajax~Ajax~xhrResponseType
* @property {Number} status - The response status.
* @property {Object} headers - The headers used for the request.
* @property {String} body - The request body.
* @public
*/

/**
* A [kind]{@glossary kind} designed to expose the native
* [XMLHttpRequest]{@glossary XMLHttpRequest} API. Available configuration options
* are exposed by [enyo/AjaxProperties]{@link module:enyo/AjaxProperties}.
*
* This kind does not extend {@link module:enyo/Component~Component} and cannot be used
* in the [components block]{@link module:enyo/Component~Component#components}.
*
* For more information, see the documentation on [Consuming Web
* Services]{@linkplain $dev-guide/building-apps/managing-data/consuming-web-services.html}
* in the Enyo Developer Guide.
*
* @class Ajax
* @extends module:enyo/Async~Async
* @public
*/
var Ajax = module.exports = kind(
	/** @lends module:enyo/Ajax~Ajax.prototype */ {
	
	name: 'enyo.Ajax',
	
	/**
	* @private
	*/
	kind: Async,
	
	/**
	* @private
	*/
	published: AjaxProperties,
	
	/**
	* @private
	*/
	constructor: kind.inherit(function (sup) {
		return function (inParams) {
			utils.mixin(this, inParams);
			sup.apply(this, arguments);
		};
	}),
	
	/**
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			// explicilty release any XHR refs
			this.xhr = null;
			sup.apply(this, arguments);
		};
	}),
	
	/**
	* This will be set once a request has completed (successfully or unsuccessfully).
	* It is a cache of the response values.
	*
	* @type module:enyo/Ajax~Ajax~xhrResponseType
	* @default null
	* @public
	*/
	xhrResponse: null,
	
	/**
	* Executes the request with the given options. The parameter may be a
	* [hash]{@glossary Object} of properties or a [string]{@glossary String}. Both
	* represent the query string, with the hash being serialized and the string
	* being used directly.
	*
	* ```javascript
	* var query = {q: 'searchTerm'}; // -> "?q=searchTerm"
	* ```
	*
	* To provide a `POST` body, see {@link module:enyo/AjaxProperties#postBody}.
	*
	* When the request is completed, it will set the
	* [xhrResponse]{@link module:enyo/Ajax~Ajax#xhrResponse} property.
	*
	* @see module:enyo/AjaxProperties
	* @see module:enyo/Ajax~Ajax~xhrResponse
	* @param {(Object|String)} [params] - A [string]{@glossary String} or
	*	[hash]{@glossary Object} to be used as the query string.
	* @returns {this} The callee for chaining.
	* @public
	*/
	go: function (params) {
		this.failed = false;
		this.startTimer();
		this.request(params);
		return this;
	},
	
	/**
	* @private
	*/
	request: function (params) {
		var parts = this.url.split('?');
		var uri = parts.shift() || '';
		var args = parts.length ? (parts.join('?').split('&')) : [];
		//
		var query = null;
		//
		if(utils.isString(params)){
			//If params parameter is a string, use it as request body
			query = params;
		}
		else{
			//If params parameter is not a string, build a query from it
			if(params){
				query = Ajax.objectToQuery(params);
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
		var url = args.length ? [uri, args.join('&')].join('?') : uri;
		//
		var xhr_headers = {};
		var body;
		if (this.method != 'GET') {
			body = this.postBody;
			if (this.method === 'POST' && body instanceof FormData) {
				if (body.fake) {
					xhr_headers['Content-Type'] = body.getContentType();
					body = body.toString();
				} else {
					// Nothing to do as the
					// content-type will be
					// automagically set according
					// to the FormData
				}
			} else {
				xhr_headers['Content-Type'] = this.contentType;
				if (body instanceof Object) {
					if (this.contentType.match(/^application\/json(;.*)?$/) !== null) {
						body = JSON.stringify(body);
					} else if (this.contentType === 'application/x-www-form-urlencoded') {
						body = Ajax.objectToQuery(body);
					}
					else {
						body = body.toString();
					}
				}
			}
		}
		utils.mixin(xhr_headers, this.headers);
		// don't pass in headers structure if there are no headers defined as this messes
		// up CORS code for IE8-9
		if (utils.keys(xhr_headers).length === 0) {
			xhr_headers = undefined;
		}
		//
		try {
			this.xhr = Xhr.request({
				url: url,
				method: this.method,
				callback: this.bindSafely('receive'),
				body: body,
				headers: xhr_headers,
				sync: this.sync,
				username: this.username,
				password: this.password,
				xhrFields: utils.mixin({onprogress: this.bindSafely(this.updateProgress)}, this.xhrFields),
				mimeType: this.mimeType
			});
		}
		catch (e) {
			// IE can throw errors here if the XHR would fail CORS checks,
			// so catch and turn into a failure.
			this.fail(e);
		}
	},
	
	/**
	* @private
	*/
	receive: function (inText, inXhr) {
		if (!this.failed && !this.destroyed) {
			var body;
			if (inXhr.responseType === 'arraybuffer') {
				body = inXhr.response;
			} else if (typeof inXhr.responseText === 'string') {
				body = inXhr.responseText;
			} else {
				// IE carrying a binary
				body = inXhr.responseBody;
			}
			this.xhrResponse = {
				status: inXhr.status,
				headers: Ajax.parseResponseHeaders(inXhr),
				body: body
			};
			if (this.isFailure(inXhr)) {
				this.fail(inXhr.status);
			} else {
				this.respond(this.xhrToResponse(inXhr));
			}
		}
	},
	
	/**
	* @private
	*/
	fail: kind.inherit(function (sup) {
		return function (inError) {
			// on failure, explicitly cancel the XHR to prevent
			// further responses.  cancellation also resets the
			// response headers & body,
			if (this.xhr) {
				Xhr.cancel(this.xhr);
				this.xhr = null;
			}
			sup.apply(this, arguments);
		};
	}),
	
	/**
	* @private
	*/
	xhrToResponse: function (inXhr) {
		if (inXhr) {
			return this[(this.handleAs || 'text') + 'Handler'](inXhr);
		}
	},
	
	/**
	* @private
	*/
	isFailure: function (inXhr) {
		// if any exceptions are thrown while checking fields in the xhr,
		// assume a failure.
		try {
			if (inXhr.responseType === 'arraybuffer') {
				// if we are loading binary data, don't try to access inXhr.responseText
				// because that throws an exception on webkit. Instead, just look for
				// the response.
				if (inXhr.status === 0 && !inXhr.response) {
					return true;
				}
			} else {
				var text = '';
				// work around IE8-9 bug where accessing responseText will thrown error
				// for binary requests.
				if (typeof inXhr.responseText === 'string') {
					text = inXhr.responseText;
				}
				// Follow same failure policy as jQuery's Ajax code
				// CORS failures on FireFox will have status 0 and no responseText,
				// so treat that as failure.
				if (inXhr.status === 0 && text === '') {
					return true;
				}
			}
			// Otherwise, status 0 may be good for local file access.  We treat the range
			// 1-199 and 300+ as failure (only 200-series code are OK).
			return (inXhr.status !== 0) && (inXhr.status < 200 || inXhr.status >= 300);
		}
		catch (e) {
			return true;
		}
	},
	
	/**
	* @private
	*/
	xmlHandler: function (inXhr) {
		return inXhr.responseXML;
	},
	
	/**
	* @private
	*/
	textHandler: function (inXhr) {
		return inXhr.responseText;
	},
	
	/**
	* @private
	*/
	jsonHandler: function (inXhr) {
		var r = inXhr.responseText;
		try {
			return r && json.parse(r);
		} catch (x) {
			logger.warn('Ajax request set to handleAs JSON but data was not in JSON format');
			return r;
		}
	},
	
	/**
	* @private
	*/
	binaryHandler: function (inXhr) {
		return inXhr.response;
	}, 
	
	/**
	* @private
	*/
	updateProgress: function (event) {
		// IE8 doesn't properly support progress events and doesn't pass an object to the
		// handlers so we'll check that before continuing.
		if (event) {
			// filter out 'input' as it causes exceptions on some Firefox versions
			// due to unimplemented internal APIs
			var ev = {};
			for (var k in event) {
				if (k !== 'input') {
					ev[k] = event[k];
				}
			}
			this.sendProgress(event.loaded, 0, event.total, ev);
		}
	},
	
	/**
	* @private
	*/
	statics: {
		objectToQuery: function (/*Object*/ map) {
			var enc = encodeURIComponent;
			var pairs = [];
			var backstop = {};
			for (var name in map){
				var value = map[name];
				if (value != backstop[name]) {
					var assign = enc(name) + '=';
					if (utils.isArray(value)) {
						for (var i=0; i < value.length; i++) {
							pairs.push(assign + enc(value[i]));
						}
					} else {
						pairs.push(assign + enc(value));
					}
				}
			}
			return pairs.join('&');
		}
	},
	
	/**
	* @private
	*/
	protectedStatics: {
		parseResponseHeaders: function (xhr) {
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
