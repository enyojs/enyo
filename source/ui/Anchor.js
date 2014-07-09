(function (enyo, scope) {
	/**
	* _enyo.Anchor_ implements an HTML [anchor]{@link external:Anchor} (&lt;a&gt;) tag. Published 
	* properties allow you to [bind]{@link enyo.BindingSupport} the [anchor's]{@link external:Anchor} 
	* [href]{@link enyo.Anchor#href} and [title]{@link enyo.Anchor#title} 
	* [attributes]{@link external:Attribute} to appropriate fields on data 
	* [objects]{@link external:Object}.
	*
	* @class enyo.Anchor
	* @extends enyo.Control
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Anchor.prototype */ {

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
		published: 
			/** @lends enyo.Anchor.prototype */ {
			
			/** 
			* Maps to the _href_ [attribute]{@link external:Attribute} of the &lt;a&gt; tag.
			* 
			* @type {String}
			* @default ''
			* @public
			*/
			href: '',

			/**
			* Maps to the _title_ [attribute]{@link external:Attribute} of the &lt;a&gt; tag.
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
			this.setAttribute('href', this.href);
		},

		/**
		* @private
		*/
		titleChanged: function() {
			this.setAttribute('title', this.title);
		}
	});

})(enyo, this);
