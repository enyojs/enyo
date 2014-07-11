(function (enyo, scope) {
	
	/**
	* This is an internally used support mixin. It is applied to all
	* [components]{@link enyo.Component} of an {@link enyo.Application} instance and their
	* [components]{@link enyo.Component} recursively. It adds an `app` property to each instance
	* that is a local reference to the {@link enyo.Application} instance that they belong to.
	* 
	* @mixin enyo.ApplicationSupport
	* @protected
	*/
	enyo.ApplicationSupport = {
	
		/**
		* @private
		*/
		name: 'ApplicationSupport',
	
		/**
		* @private
		*/
		adjustComponentProps: enyo.inherit(function (sup) {
			return function (props) {
				props.app = props.app || this.app || (this instanceof enyo.Application && this);
				sup.apply(this, arguments);
			};
		}),
	
		/**
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				// release the reference to the application
				this.app = null;
				sup.apply(this, arguments);
			};
		})
	
	};

})(enyo, this);
