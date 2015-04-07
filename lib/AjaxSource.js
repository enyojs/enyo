require('enyo');

var
	kind = require('./kind');

var
	XhrSource = require('./XhrSource'),
	Ajax = require('./Ajax'),
	AjaxProperties = require('./AjaxProperties');

/**
* An all-purpose [Ajax]{@glossary ajax} [source]{@link enyo.Source} designed to communicate
* with REST-ful API backends.
*
* @class enyo.AjaxSource
* @extends enyo.XHRSource
* @public
*/
module.exports = kind(
	/** @lends enyo.AjaxSource.prototype */ {
	
	name: 'enyo.AjaxSource',
	
	/**
	* @private
	*/
	kind: XhrSource,
	
	/**
	* @see enyo.XHRSource.requestKind
	* @default enyo.Ajax
	* @public
	*/
	requestKind: Ajax,
	
	/**
	* @private
	*/

	
	/**
	* An [array]{@glossary Array} of the keys that will be used for the options passed to
	* the [requestKind]{@link enyo.XHRSource#requestKind}.
	*
	* @see enyo.AjaxProperties
	* @type {String[]}
	* @readonly
	* @public
	*/
	allowed: Object.keys(AjaxProperties),
	
	/**
	* Implementation of {@link enyo.Source.fetch}.
	*
	* @see enyo.Source.fetch
	* @public
	*/
	fetch: function (model, opts) {
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
		opts.method = 'DELETE';
		opts.url = this.buildUrl(model, opts);
		this.go(opts);
	}
});