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
	* Whether or not navigation should be restricted to this control (and its children). This will
	* only apply to elements that are descendants of this control and are part of the default set of
	* higlight-able items.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	restrictNavigation: undefined,

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.navigableSections = (this.navigableSections === undefined) ? {} : this.navigableSections;
			this.restrictNavigation = (this.restrictNavigation === undefined) ? false : this.restrictNavigation;
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
				sections['default'] = '.highlightable';
			}

			for (id in sections) { // add sections
				SpatialNavigation.add({
					selector: sections[id],
					id: id,
					restrict: id != 'default' && this.restrictNavigation ? 'self-only' : 'none'
				});
				SpatialNavigation.makeFocusable(id);
			}

			// global config for disabled elements
			SpatialNavigation.set({
				navigableFilter: function (elem) {
					if (elem.getAttribute('data-disabled')) return false; // more semantic and standard approach
				}
			});

			SpatialNavigation.focus();
		};
	}),

	/**
	* @private
	*/
	showingChanged: kind.inherit(function (sup) {
		return function (was, is) {
			if (is) {
				SpatialNavigation.disable('default');
			} else {
				SpatialNavigation.enable('default');
			}

			sup.apply(this, arguments);
		};
	})
};

module.exports = Highlightable;
