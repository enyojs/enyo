require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Anchor~Anchor} kind.
* @module enyo/Anchor
*/

var
	kind = require('./kind');
var
	Control = require('./Control');

/**
* {@link module:enyo/Anchor~Anchor} implements an HTML [anchor]{@glossary Anchor} (&lt;a&gt;) tag.
* Published properties allow you to [bind]{@link module:enyo/BindingSupport~BindingSupport} the anchor's
* [href]{@link module:enyo/Anchor~Anchor#href} and [title]{@link module:enyo/Anchor~Anchor#title}
* [attributes]{@glossary Attribute} to appropriate fields on data
* [objects]{@glossary Object}.
* 
* @class Anchor
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Anchor~Anchor.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Anchor',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	tag: 'a',

	/** 
	* @private
	*/
	published: 
		/** @lends module:enyo/Anchor~Anchor.prototype */ {
		
		/** 
		* Maps to the `href` [attribute]{@glossary Attribute} of the &lt;a&gt; tag.
		* 
		* @type {String}
		* @default ''
		* @public
		*/
		href: '',

		/**
		* Maps to the `title` [attribute]{@glossary Attribute} of the &lt;a&gt; tag.
		* 
		* @type {String}
		* @default  ''
		* @public
		*/
		title: ''
	},

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.hrefChanged();
			this.titleChanged();
		};
	}),

	/**
	* @private
	*/
	hrefChanged: function () {
		this.setAttribute('href', this.href);
	},

	/**
	* @private
	*/
	titleChanged: function () {
		this.setAttribute('title', this.title);
	}
});
