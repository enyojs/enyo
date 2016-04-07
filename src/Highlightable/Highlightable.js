/**
* This module exports the {@link module:enyo/Highlightable~Highlightable} mixin.
*
* @wip
* @module enyo/Highlightable
*/

var
	kind = require('enyo/kind');

var
	SpatialNavigation = require('js-spatial-navigation');

/**
* The {@link module:enyo/Highlightable~Highlightable} [mixin]{@glossary mixin} is applicable
* to any control that wishes to support 5-way and pointer-based navigation.
*
* @mixin
* @wip
* @public
*/
var Highlightable = {

	/**
	* @ignore
	* @readonly
	* @private
	*/
	name: 'Highlightable',

	/**
	* The set of sections and associated selectors, keyed by the section id. These are in addition
	* to built-in support for the default set of highlight-able items, keyed by the "default" string
	* id with the ".highlightable" selector.
	*
	* @type {Object}
	* @default {}
	* @public
	*/
	navigableSections: undefined,

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.navigableSections = (this.navigableSections === undefined) ? {} : this.navigableSections;
		};
	}),

	/**
	* @method
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function () {
			var sections = this.navigableSections,
				id;

			sup.apply(this, arguments);

			// setup spatial navigation
			SpatialNavigation.init();

			if (!SpatialNavigation.enable('default')) { // if we cannot enable, it does not exist
				sections['default'] = '.highlightable:not(.disabled)';
			}

			for (id in sections) { // add sections
				SpatialNavigation.add({
					selector: sections[id],
					id: id
				});
				SpatialNavigation.makeFocusable(id);
			}

			SpatialNavigation.focus();
		};
	})
};

module.exports = Highlightable;
