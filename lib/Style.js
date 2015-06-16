require('enyo');

/**
* Contains the declaration for the {@link enyo.Style} kind.
* @module enyo/Style
*/

var
	kind = require('./kind');
var
	Control = require('./Control');

/**
* {@link enyo.Style} is a wrapper for a [&lt;style&gt;]{@glossary style} tag;
* it automatically wraps the [content]{@link enyo.Control#content} property
* with proper CSS comment formatting.
*
* @namespace enyo
* @class enyo.Style
* @definedby module:enyo/Style
* @public
*/
module.exports = kind(
	/** @lends enyo.Style.prototype */ {
	
	name: 'enyo.Style',
	
	kind: Control,
	
	/**
	* @private
	*/
	tag: 'style',

	/**
	* @private
	*/
	classes: 'enyo-style',

	/**
	* @private
	*/
	attributes: {
		type: 'text/css'
	},

	/**
	* @private
	*/
	allowHtml: true,

	/**
	* @private
	*/
	contentChanged: kind.inherit(function (sup) {
		return function () {
			this.content = '<!--\n' + this.content + '\n-->';
			sup.apply(this, arguments);
		};
	})
});
