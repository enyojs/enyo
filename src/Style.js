require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Style~Style} kind.
* @module enyo/Style
*/

var
	kind = require('./kind');
var
	Control = require('./Control');

/**
* {@link module:enyo/Style~Style} is a wrapper for a [&lt;style&gt;]{@glossary style} tag;
* it automatically wraps the [content]{@link module:enyo/Control~Control#content} property
* with proper CSS comment formatting.
*
* @class Style
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Style~Style.prototype */ {
	
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
