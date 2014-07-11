(function (enyo, scope) {

	/**
	* A [async]{@link enyo.Async} task specifically designed to wrap [JSONP]{@link external:JSONP}
	* requests to a remote server. Make sure to read about the use-case for
	* [JSONP]{@link external:JSONP} requests and the
	* [Consuming Web Services](building-apps/managing-data/consuming-web-services.html) in the Enyo
	* Developer Guide.
	*
	* @class enyo.JsonRequest
	* @extends enyo.Async
	* @public
	*/
	enyo.kind(
		/** @lends enyo.JsonRequest.prototype */ {
		
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
			* @memberof enyo.JsonRequest.prototype
			* @type {String}
			* @default ''
			* @public
			*/
			url: '',
			
			/**
			* The optional character set to use to interpret the return data.
			*
			* @memberof enyo.JsonRequest.prototype
			* @type {String}
			* @default null
			* @public
			*/
			charset: null,
			
			/**
			* This is the name of the [function]{@link external:Function} that is included in the
			* encoded arguments and used to wrap the return value from the server. This can also
			* be set to `null` in some cases.
			*
			* @see enyo.JsonRequest#overrideCallback
			* @memberof enyo.JsonRequest.prototype
			* @type {String}
			* @default 'callback'
			* @public
			*/
			callbackName: 'callback',
			
			/**
			* Will append a randum number as a parameter for GET requests to (_attempt_) to force a
			* new fetch of the resource instead of reusing a local cache.
			*
			* @memberof enyo.JsonRequest.prototype
			* @type {Boolean}
			* @default true
			* @public
			*/
			cacheBust: true,
			
			/**
			* In cases where a backend is inflexible with
			* [callback]{@link enyo.JsonRequest#callback} names this property can be used to
			* specify a global [function]{@link external:Function} instead. Note that when using
			* this, it will replace any existing [function]{@link external:Function} of the given
			* name and only _one_ [JsonRequest]{@link enyo.JsonRequest} using this property can be
			* active at a time.
			*
			* @memberof enyo.JsonRequest.prototype
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
		* successfully. Overloaded from {@link enyo.Async#go}.
		*
		* @param {*} value The value to pass to responders.
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
		* For a string version of inParams, we follow the convention of
		* replacing the string '=?' with the callback name. For the more
		* common case of inParams being an object, we'll add a argument named
		* using the callbackName published property.
		*
		* @private
		*/
		bodyArgsFromParams: function(params, fn) {
			if (enyo.isString(params)) {
				return params.replace('=?', '=' + fn);
			} else {
				params = enyo.clone(params, true);
				if (this.callbackName) {
					params[this.callbackName] = fn;
				}
				return enyo.Ajax.objectToQuery(params);
			}
		}
	});

})(enyo, this);