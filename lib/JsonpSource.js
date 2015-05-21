require('enyo');

/**
* Contains the declaration for the {@link enyo.JsonpSource} kind.
* @module enyo/JsonpSource
*/

var
	kind = require('./kind');

var
	XhrSource = require('./XhrSource'),
	JsonpRequest = require('./Jsonp');

/**
* An all-purpose [Ajax]{@glossary ajax} [source]{@link enyo.Source} designed to communicate
* with REST-ful API backends that support JSONP-style callbacks.
*
* @namespace enyo
* @class enyo.JsonpSource
* @extends enyo.XhrSource
* @definedby module:enyo/JsonpSource
* @public
*/
module.exports = kind(
	/** @lends enyo.JsonpSource.prototype */ {
	
	name: 'enyo.JsonpSource',
	
	/**
	* @private
	*/
	kind: XhrSource,
	
	/**
	* @see enyo.XhrSource.requestKind
	* @default enyo.JsonpRequest
	* @public
	*/
	requestKind: JsonpRequest,
	
	/**
	* @private
	*/

	
	/**
	* An [array]{@glossary Array} of the keys that will be used for the options passed to
	* the [requestKind]{@link module:enyo/XhrSource.requestKind}.
	*
	* @see enyo.AjaxProperties
	* @type {String[]}
	* @readonly
	* @public
	*/
	allowed: Object.keys(JsonpRequest.prototype.published),
	
	/**
	* Implementation of {@link enyo.Source.fetch}.
	*
	* @see enyo.Source.fetch
	* @public
	*/
	fetch: function (model, opts) {
		opts.cacheBust = false;
		opts.method = 'GET';
		opts.url = this.buildUrl(model, opts);
		this.go(opts);
	},
	
	/**
	* Implementation of {@link enyo.Source.commit}.
	*
	* @see enyo.Source.commit
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
	* Implementation of {@link enyo.Source.destroy}.
	*
	* @see enyo.Source.destroy
	* @public
	*/
	destroy: function (model, opts) {
		opts.cacheBust = false;
		opts.method = 'DELETE';
		opts.url = this.buildUrl(model, opts);
		this.go(opts);
	}
});
