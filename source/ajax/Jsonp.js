(function (enyo, scope) {

	/**
	* {@link enyo.JsonpRequest} is an [Async]{@link enyo.Async} task specifically designed
	* to wrap {@glossary JSONP} requests to a remote server. Be sure to read about the use
	* cases for JSONP requests, along with the documentation on [Consuming Web
	* Services]{@linkplain $dev-guide/building-apps/managing-data/consuming-web-services.html}
	* in the Enyo Developer Guide.
	*
	* @class enyo.JsonpRequest
	* @extends enyo.Async
	* @public
	*/
	enyo.kind(
		/** @lends enyo.JsonpRequest.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.JsonpRequest',
		
		/**
		* @private
		*/
		kind: 'enyo.Async',
		
		/**
		* @private
		*/
		published: {
			
			/**
			* The URL for the service.
			*
			* @memberof enyo.JsonpRequest.prototype
			* @type {String}
			* @default ''
			* @public
			*/
			url: '',
			
			/**
			* The optional character set to use to interpret the return data.
			*
			* @memberof enyo.JsonpRequest.prototype
			* @type {String}
			* @default null
			* @public
			*/
			charset: null,
			
			/**
			* The name of the [function]{@glossary Function} that is included in the
			* encoded arguments and used to wrap the return value from the server.
			* This may also be set to `null` in some cases.
			*
			* @see enyo.JsonpRequest.overrideCallback
			* @memberof enyo.JsonpRequest.prototype
			* @type {String}
			* @default 'callback'
			* @public
			*/
			callbackName: 'callback',
			
			/**
			* When `true`, a random number is appended as a parameter for GET requests
			* to (attempt to) force a new fetch of the resource instead of reusing a
			* local cache.
			*
			* @memberof enyo.JsonpRequest.prototype
			* @type {Boolean}
			* @default true
			* @public
			*/
			cacheBust: true,
			
			/**
			* In cases where a backend is inflexible with regard to
			* [callback]{@link enyo.JsonpRequest#callback} names, this property may be used to
			* specify a global [function]{@glossary Function} instead. Note that when using
			* this, it will replace any existing function with the given
			* name and only one [JsonpRequest]{@link enyo.JsonpRequest} using this property may
			* be active at a time.
			*
			* @memberof enyo.JsonpRequest.prototype
			* @type {String}
			* @default null
			* @public
			*/
			overrideCallback: null
		},
		
		/**
		* @private
		*/
		protectedStatics: {
			// Counter to allow creation of unique name for each JSONP request
			nextCallbackID: 0
		},
		
		/**
		* @private
		*/
		addScriptElement: function () {
			var script = document.createElement('script');
			script.src = this.src;
			script.async = 'async';
			if (this.charset) {
				script.charset = this.charset;
			}
			// most modern browsers also have an onerror handler
			script.onerror = this.bindSafely(function() {
				// we don't get an error code, so we'll just use the generic 400 error status
				this.fail(400);
			});
			// add script before existing script to make sure it's in a valid part of document
			// http://www.jspatterns.com/the-ridiculous-case-of-adding-a-script-element/
			var first = document.getElementsByTagName('script')[0];
			first.parentNode.insertBefore(script, first);
			this.scriptTag = script;
		},
		
		/**
		* @private
		*/
		removeScriptElement: function () {
			var script = this.scriptTag;
			this.scriptTag = null;
			script.onerror = null;
			if (script.parentNode) {
				script.parentNode.removeChild(script);
			}
		},
		
		/**
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function (params) {
				enyo.mixin(this, params);
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* Initiates the asynchronous routine and will supply the given value if it completes
		* successfully. Overloaded from [enyo.Async.go()]{@link enyo.Async#go}.
		*
		* @param {*} value - The value to pass to responders.
		* @returns {this} The callee for chaining.
		* @public
		*/
		go: function (value) {
			this.startTimer();
			this.jsonp(value);
			return this;
		},
		
		/**
		* @private
		*/
		jsonp: function (params) {
			var callbackFunctionName = this.overrideCallback ||
				'enyo_jsonp_callback_' + (enyo.JsonpRequest.nextCallbackID++);
			//
			this.src = this.buildUrl(params, callbackFunctionName);
			this.addScriptElement();
			//
			window[callbackFunctionName] = this.bindSafely(this.respond);
			//
			// setup cleanup handlers for JSONP completion and failure
			var cleanup = this.bindSafely(function() {
				this.removeScriptElement();
				window[callbackFunctionName] = null;
			});
			this.response(cleanup);
			this.error(cleanup);
		},
		
		/**
		* @private
		*/
		buildUrl: function(params, fn) {
			var parts = this.url.split('?');
			var uri = parts.shift() || '';
			var args = parts.length? parts.join('?').split('&'): [];
			//
			var bodyArgs = this.bodyArgsFromParams(params, fn);
			args.push(bodyArgs);
			if (this.cacheBust) {
				args.push(Math.random());
			}
			//
			return [uri, args.join('&')].join('?');
		},
		
		/**
		* If `params` is a string, we follow the convention of replacing the string
		* `'=?'` with the callback name. If `params` is an object (the more common
		* case), we add an argument using the `callbackName` published property.
		*
		* @private
		*/
		bodyArgsFromParams: function(params, fn) {
			if (enyo.isString(params)) {
				return params.replace('=?', '=' + fn);
			} else {
				params = params ? enyo.clone(params, true) : {};
				if (this.callbackName) {
					params[this.callbackName] = fn;
				}
				return enyo.Ajax.objectToQuery(params);
			}
		}
	});

})(enyo, this);