require('enyo');

/**
* Contains the declaration for the {@link enyo.BaseLayout} kind.
* @module enyo/BaseLayout
*/

var
	kind = require('./kind'),
	utils = require('./utils');

var
	Layout = require('./Layout');

/**
* {@link enyo.BaseLayout} provides a basic [layout]{@glossary layout} strategy,
* positioning contained [components]{@link enyo.Component} with the `enyo-positioned`
* [layoutClass]{@link enyo.BaseLayout#layoutClass}. In addition, it adjusts the
* layout when [reflow()]{@link enyo.BaseLayout#reflow} is called, removing or adding
* the `enyo-fit` class for components that have set the [fit]{@link enyo.Component#fit}
* property.
*
* @namespace enyo
* @class enyo.BaseLayout
* @extends enyo.Layout
* @definedby module:enyo/BaseLayout
* @public
*/
module.exports = kind(
	/** @lends enyo.BaseLayout.prototype */ {

	name: 'enyo.BaseLayout',

	/**
	* @private
	*/
	kind: Layout,

	/**
	* The name of the class to apply to components that are being positioned by a 
	* [layout]{@glossary layout} strategy.
	* 
	* @type {String}
	* @default 'enyo-positioned'
	* @public
	*/
	layoutClass: 'enyo-positioned',

	/**
	* Adds or removes the `enyo-fit` class for [components]{@link enyo.Component} whose 
	* [fit]{@link enyo.Component#fit} property has been set.
	* 
	* @public
	*/
	reflow: function () {
		utils.forEach(this.container.children, function(c) {
			if (c.fit !== null) {
				c.addRemoveClass('enyo-fit', c.fit);
			}
		}, this);
	}
});

//enyo.Control.prototype.layoutKind = "enyo.BaseLayout";
