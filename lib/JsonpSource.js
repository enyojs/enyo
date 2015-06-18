require('enyo');

/**
* Contains the declaration for the {@link module:enyo/JsonpSource~JsonpSource} kind.
* @module enyo/JsonpSource
*/

var
	kind = require('./kind');

var
	XhrSource = require('./XhrSource'),
	JsonpRequest = require('./Jsonp');

/**
* An all-purpose [Ajax]{@glossary ajax} [source]{@link module:enyo/Source~Source} designed to communicate
* with REST-ful API backends that support JSONP-style callbacks.
*
* @class JsonpSource
* @extends module:enyo/XhrSource~XhrSource
* @public
*/
module.exports = kind(
	/** @lends module:enyo/JsonpSource~JsonpSource.prototype */ {
	
	name: 'enyo.JsonpSource',
	
	/**
	* @private
	*/
	kind: XhrSource,
	
	/**
	* @see module:enyo/XhrSource~XhrSource#requestKind
	* @default module:enyo/JsonpSource#JsonpRequest
	* @public
	*/
	requestKind: JsonpRequest,
	
	/**
	* @private
	*/

	
	/**
	* An [array]{@glossary Array} of the keys that will be used for the options passed to
	* the [requestKind]{@link module:enyo/XhrSource~XhrSource#requestKind}.
	*
	* @see module:enyo/AjaxProperties#AjaxProperties
	* @type {String[]}
	* @readonly
	* @public
	*/
	allowed: Object.keys(JsonpRequest.prototype.published),
	
	/**
	* Implementation of {@link module:enyo/Source~Source#fetch}.
	*
	* @see module:enyo/Source~Source#fetch
	* @public
	*/
	fetch: function (model, opts) {
		opts.cacheBust = false;
		opts.method = 'GET';
		opts.url = this.buildUrl(model, opts);
		this.go(opts);
	},
	
	/**
	* Implementation of {@link module:enyo/Source~Source#commit}.
	*
	* @see module:enyo/Source~Source#commit
	* @public
	*/
	commit: function (model, opts) {
		opts.cacheBust = false;
		opts.method = model.isNew? 'POST': 'PUT';
		opts.url = this.buildUrl(model, opts);
		opts.postBody = opts.postBody || model.toJSON();
		this.go(opts);
	},
	
	/**
	* Implementation of {@link module:enyo/Source~Source#destroy}.
	*
	* @see module:enyo/Source~Source#destroy
	* @public
	*/
	destroy: function (model, opts) {
		opts.cacheBust = false;
		opts.method = 'DELETE';
		opts.url = this.buildUrl(model, opts);
		this.go(opts);
	}
});
