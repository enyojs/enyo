/**
* Exports the {@link module:enyo/StylesheetSupport} mixin.
* @module enyo/StylesheetSupport
*/

require('enyo');

var
	kind = require('./kind');

var 
	Style = require('./Style');

/**
* The {@link module:enyo/StylesheetSupport} {@glossary mixin} is used to add a
* "side-car" inline stylesheet to a [control]{@link module:enyo/Control~Control}, specifically
* for procedurally-generated CSS that can't live in the more appropriate
* location (i.e., in a CSS/LESS file).
*
* @mixin
* @public
*/
module.exports = {
	
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
		* @public
		*/
		stylesheetContent: ''
	},

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			// debugger;
			this._stylesheet_tag = this.owner.createComponent({kind: Style}, {owner: this});

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
	stylesheetContentChanged: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this._stylesheet_tag.set('content', this.stylesheetContent);
		};
	}),

	/**
	* Allows you to append a string to the existing [stylesheet]{@link module:enyo/Style~Style} 
	* block.
	*
	* @method
	* @public
	*/
	addStylesheetContent: kind.inherit(function (sup) {
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
