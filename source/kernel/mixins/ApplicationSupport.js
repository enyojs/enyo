(function (enyo, scope) {
	
	/**
	* An internally-used support {@glossary mixin} that is applied to all
	* [components]{@link enyo.Component} of an {@link enyo.Application} instance
	* (and to their components, recursively). This mixin adds an `app` property to
	* each component--a local reference to the `enyo.Application` instance that
	* the component belongs to.
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
