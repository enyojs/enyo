/**
* _enyo.Anchor_ implements an [HTML anchor]{@link external:Anchor} (&lt;a&gt;) tag. Published 
* properties allow you to bind the anchor's [href]{@link enyo.Anchor#href} and 
* [title]{@link enyo.Anchor#title} attributes to appropriate fields on data 
* [objects]{@link external:Object}.
*
* @class enyo.Anchor
* @public
*/
enyo.kind({
	/**
	* @private
	*/
	name: 'enyo.Anchor',
	/**
	* @private
	*/
	kind: 'enyo.Control',
	/**
	* @private
	*/
	tag: 'a',
	/** 
	* @private
	*/
	published: {
		/** 
		* Maps to the _href_ attribute of the &lt;a&gt; tag.
		* 
		* @type {String}
		* @default ''
		* @memberof enyo.Anchor.prototype
		* @public
		*/
		href: '',
		/**
		* Maps to the _title_ attribute of the &lt;a&gt; tag.
		* 
		* @type {String}
		* @default  ''
		* @memberof enyo.Anchor.prototype
		* @public
		*/
		title: ''
	},
	/**
	* @private
	*/
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.hrefChanged();
			this.titleChanged();
		};
	}),
	/**
	* @private
	*/
	hrefChanged: function() {
		this.setAttribute("href", this.href);
	},
	/**
	* @private
	*/
	titleChanged: function() {
		this.setAttribute("title", this.title);
	}
});
