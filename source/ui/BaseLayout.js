(function (enyo, scope) {
	/**
	* {@link enyo.BaseLayout} provides a basic [layout]{@glossary layout} strategy,
	* positioning contained [components]{@link enyo.Component} with the `enyo-positioned`
	* [layoutClass]{@link enyo.BaseLayout#layoutClass}. In addition, it adjusts the
	* layout when [reflow()]{@link enyo.BaseLayout#reflow} is called, removing or adding
	* the `enyo-fit` class for components that have set the [fit]{@link enyo.Component#fit}
	* property.
	*
	* @class enyo.BaseLayout
	* @extends enyo.Layout
	* @public
	*/
	enyo.kind(
		/** @lends enyo.BaseLayout.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.BaseLayout',

		/**
		* @private
		*/
		kind: 'enyo.Layout',

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
			enyo.forEach(this.container.children, function(c) {
				if (c.fit !== null) {
					c.addRemoveClass('enyo-fit', c.fit);
				}
			}, this);
		}
	});

	//enyo.Control.prototype.layoutKind = "enyo.BaseLayout";

})(enyo, this);
