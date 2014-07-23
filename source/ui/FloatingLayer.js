(function (enyo, scope) {
	/**
	* _enyo.FloatingLayer_ is a [control]{@link enyo.Control} that provides a layer for 
	* [controls]{@link enyo.Control} that should be displayed above an 
	* [application]{@link enyo.Application}. The FloatingLayer singleton can be set as a 
	* [control's]{@link enyo.Control} parent to have the [control]{@link enyo.Control} float above 
	* an [application]{@link enyo.Application}, e.g.:
	*
	* ```
	* create: enyo.inherit(function (sup) {
	*	return function() {
	*		sup.apply(this, arguments);
	*		this.setParent(enyo.floatingLayer);
	*	}
	* });
	* ```
	* 
	* Note: It's not intended that users create instances of _enyo.FloatingLayer_.
	*
	* @class enyo.FloatingLayer
	* @protected
	*/
	enyo.kind(
		/** @lends enyo.FloatingLayer.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.FloatingLayer',
		
		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.setParent(null);
			};
		}),

		/**
		* Detect when [node]{@link external:Node} is detatched due to document.body being stomped.
		*
		* @method
		* @private
		*/
		hasNode: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				if (this.node && !this.node.parentNode) {
					this.teardownRender();
				}
				return this.node;
			};
		}),

		/**
		* @method
		* @private
		*/
		render: enyo.inherit(function (sup) {
			return function() {
				this.parentNode = document.body;
				return sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		generateInnerHtml: function() {
			return '';
		},

		/**
		* @private
		*/
		beforeChildRender: function() {
			if (!this.hasNode()) {
				this.render();
			}
		},

		/**
		* @private
		*/
		teardownChildren: function() {
		}
	});

	enyo.floatingLayer = new enyo.FloatingLayer();
	
})(enyo, this);