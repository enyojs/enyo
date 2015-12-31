require('enyo');

/**
* Contains the declaration for the {@link module:enyo/WebService~WebService} kind.
* @module enyo/WebService
*/

var
	kind = require('./kind'),
	utils = require('./utils');

var
	Component = require('./Component'),
	JsonpRequest = require('./Jsonp'),
	AjaxProperties = require('./AjaxProperties'),
	Ajax = require('./Ajax');

/**
* Fires when a response is received.
*
* @event module:enyo/WebService~WebService#onResponse
* @type {Object}
* @property {module:enyo/Async~Async} ajax - The {@link module:enyo/Async~Async} instance associated with the request.
* @property {*} data - Any response data associated with the request.
* @public
*/

/**
* Fires when an error is received.
*
* @event module:enyo/WebService~WebService#onError
* @type {Object}
* @property {module:enyo/Async~Async} ajax - The {@link module:enyo/Async~Async} instance associated with the request.
* @property {*} data - Any response data associated with the request.
* @public
*/

/**
* Fires when the request progresses. This event is the raw
* [ProgressEvent]{@glossary ProgressEvent}.
*
* @see {@glossary ProgressEvent}
* @event module:enyo/WebService~WebService#onProgress
* @type {Object}
* @property {Boolean} lengthComputable - The read-only flag indicating whether the progress
*	is computable.
* @property {Number} loaded - The read-only value of the downloaded resources.
* @property {Number} total - The read-only value used to indicate how much of a resource
* is left to be acquired.
* @public
*/

/**
* An internally-used class.
*
* @private
*/
var AjaxComponent = kind({
	kind: Component,
	published: AjaxProperties
});

/**
* A [component]{@link module:enyo/Component~Component} that performs [XHR]{@glossary XMLHttpRequest}
* requests. Internally, it relies on the [Async]{@link module:enyo/Async~Async} subkinds
* ({@link module:enyo/Ajax~Ajax} and {@link module:enyo/Jsonp~JsonpRequest}) to manage transactions.
*
* By default, {@link module:enyo/WebService~WebService} uses `enyo/Ajax` and publishes all of its
* properties via the [enyo/AjaxProperties]{@link module:enyo/AjaxProperties} module.
*
* To use `enyo/Jsonp/JsonpRequest` instead of `enyo/Ajax`, set
* [jsonp]{@link module:enyo/WebService~WebService#jsonp} to `true` (defaults to `false`).
*
* For more information, see the documentation on [Consuming Web
* Services]{@linkplain $dev-guide/building-apps/managing-data/consuming-web-services.html}
* in the Enyo Developer Guide.
*
* @class WebService
* @extends module:enyo/Component~Component
* @public
*/
module.exports = kind(
	/** @lends module:enyo/WebService~WebService.prototype */ {
	
	name: 'enyo.WebService',
	
	/**
	* @private
	*/
	kind: AjaxComponent,
	
	/**
	* @private
	*/
	published: {
		
		/**
		* Indicates whether or not to use the [JSONP]{@glossary JSONP} protocol (and
		* {@link module:enyo/Jsonp~JsonpRequest} instead of {@link module:enyo/Ajax~Ajax}).
		*
		* @memberof enyo.WebService.prototype
		* @type {Boolean}
		* @default false
		* @public
		*/
		jsonp: false,
		
		/**
		* When using [JSONP]{@glossary JSONP}, this is the name of the callback parameter.
		* Note that this not the name of a callback function, but only the name of the callback
		* parameter. Enyo will create an internal callback function as necessary.
		*
		* @see module:enyo/WebService~WebService.jsonp
		* @memberof enyo.WebService.prototype
		* @type {String}
		* @default 'callback'
		* @public
		*/
		callbackName: 'callback',
		
		/**
		* When using [JSONP]{@glossary JSONP}, the optional character set to use to
		* interpret the return data.
		*
		* @see module:enyo/WebService~WebService.jsonp
		* @memberof enyo.WebService.prototype
		* @type {String}
		* @default null
		* @public
		*/
		charset: null,
		
		/**
		* If set to a non-zero value, the number of milliseconds to wait after the
		* [send()]{@link module:enyo/WebService~WebService#send} call before failing with a timeout
		* error.
		*
		* @memberof enyo.WebService.prototype
		* @type {Number}
		* @default 0
		* @public
		*/
		timeout: 0
	},
	
	/**
	* @private
	*/
	events: {
		onResponse: '',
		onError: '',
		onProgress: ''
	},
	
	/**
	* Sends an XHR request with the given parameters, returning the associated
	* {@link module:enyo/Async~Async} instance.
	*
	* @param {Object} params - The parameters to pass to the request.
	* @param {Object} [props] - The optional properties to override the
	*	{@link module:enyo/AjaxProperties} of the request.
	* @returns {module:enyo/Async~Async} The associated {@link module:enyo/Async~Async} instance.
	* @public
	*/
	send: function (params, props) {
		return this.jsonp ? this.sendJsonp(params, props) : this.sendAjax(params, props);
	},
	
	/**
	* @private
	*/
	sendJsonp: function (params, props) {
		var jsonp = new JsonpRequest();
		for (var n in {'url':1, 'callbackName':1, 'charset':1, 'timeout':1}) {
			jsonp[n] = this[n];
		}
		utils.mixin(jsonp, props);
		return this.sendAsync(jsonp, params);
	},
	
	/**
	* @private
	*/
	sendAjax: function (params, props) {
		var ajax = new Ajax(props);
		for (var n in AjaxProperties) {
			ajax[n] = this[n];
		}
		ajax.timeout = this.timeout;
		utils.mixin(ajax, props);
		return this.sendAsync(ajax, params);
	},
	
	/**
	* @private
	*/
	sendAsync: function (ajax, params) {
		return ajax.go(params).response(this, 'response').error(this, 'error').progress(this, 'progress');
	},
	
	/**
	* @private
	*/
	response: function (sender, data) {
		this.doResponse({ajax: sender, data: data});
	},
	
	/**
	* @private
	*/
	error: function (sender, data) {
		this.doError({ajax: sender, data: data});
	},
	
	/**
	* @private
	*/
	progress: function (sender, event) {
		this.doProgress(event);
	}
});
