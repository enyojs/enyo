require('enyo');

/**
* Contains the declaration for the {@link enyo.Anchor} kind.
* @module enyo/Anchor
*/

var
	kind = require('./kind');
var
	Control = require('./Control');

/**
* {@link enyo.Anchor} implements an HTML [anchor]{@glossary Anchor} (&lt;a&gt;) tag.
* Published properties allow you to [bind]{@link module:enyo/BindingSupport} the anchor's
* [href]{@link enyo.Anchor#href} and [title]{@link enyo.Anchor#title}
* [attributes]{@glossary Attribute} to appropriate fields on data
* [objects]{@glossary Object}.
* 
* @namespace enyo
* @class enyo.Anchor
* @extends enyo.Control
* @ui
* @definedby module:enyo/Anchor
* @public
*/
module.exports = kind(
	/** @lends enyo.Anchor.prototype */ {

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
		/** @lends enyo.Anchor.prototype */ {
		
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
