require('enyo');

/**
* Contains the declaration for the {@link module:enyo/BaseLayout~BaseLayout} kind.
* @module enyo/BaseLayout
*/

var
	kind = require('./kind'),
	utils = require('./utils');

var
	Layout = require('./Layout');

/**
* {@link module:enyo/BaseLayout~BaseLayout} provides a basic [layout]{@glossary layout} strategy,
* positioning contained [components]{@link module:enyo/Component~Component} with the `enyo-positioned`
* [layoutClass]{@link module:enyo/BaseLayout~BaseLayout#layoutClass}. In addition, it adjusts the
* layout when [reflow()]{@link module:enyo/BaseLayout~BaseLayout#reflow} is called, removing or adding
* the `enyo-fit` class for components that have set the [fit]{@link module:enyo/Component~Component#fit}
* property.
*
* @class BaseLayout
* @extends module:enyo/Layout~Layout
* @public
*/
module.exports = kind(
	/** @lends module:enyo/BaseLayout~BaseLayout.prototype */ {

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
	* Adds or removes the `enyo-fit` class for [components]{@link module:enyo/Component~Component} whose 
	* [fit]{@link module:enyo/Component~Component#fit} property has been set.
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
