(function (enyo, scope) {
	/**
	* The {@link enyo.StylesheetSupport} {@glossary mixin} is used to add a
	* "side-car" inline stylesheet to a [control]{@link enyo.Control}, specifically
	* for procedurally-generated CSS that can't live in the more appropriate
	* location (i.e., in a CSS/LESS file).
	*
	* @mixin enyo.StylesheetSupport
	* @public
	*/
	enyo.StylesheetSupport = {
		
		/**
		* @private
		*/
		_stylesheet_tag: null,

		/**
		* @private
		*/
		_stylesheet_id_suffix: '_stylesheet',

		/**
		* @private
		*/
		published: {

			/**
			* Set `stylesheetContent` to the CSS you'd like to appear in the stylesheet.
			* 
			* @type {String}
			* @default ''
			* @memberof enyo.StylesheetSupport.prototype
			* @public
			*/
			stylesheetContent: ''
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				// debugger;
				this._stylesheet_tag = this.owner.createComponent({kind: 'enyo.Style'}, {owner: this});

				// Only change if it has something to set.
				if (this.stylesheetContent) {
					this.stylesheetContentChanged();
				}

				// Run SUPER last, in case 'create' manipulates stylesheetContent.
				sup.apply(this, arguments);

				this._stylesheet_tag.set('id', this._stylesheet_getId());
			};
		}),

		/**
		* @method
		* @private
		*/
		stylesheetContentChanged: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this._stylesheet_tag.set('content', this.stylesheetContent);
			};
		}),

		/**
		* Allows you to append a string to the existing [stylesheet]{@link enyo.Style} 
		* block.
		*
		* @method
		* @public
		*/
		addStylesheetContent: enyo.inherit(function (sup) {
			return function(newStyle) {
				sup.apply(this, arguments);
				var existingStyle = this.get('stylesheetContent');
				this.set('stylesheetContent', (existingStyle ? existingStyle + '\n' : '' ) + newStyle);
			};
		}),

		/**
		* @private
		*/
		_stylesheet_getId: function () {
			return this.getId() + this._stylesheet_id_suffix;
		}
	};

})(enyo, this);
