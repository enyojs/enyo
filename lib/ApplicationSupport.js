require('enyo');

var kind = require('./kind');

/**
* An internally-used support {@glossary mixin} that is applied to all
* [components]{@link module:enyo/Component~Component} of an {@link module:enyo/Application~Application} instance
* (and to their components, recursively). This mixin adds an `app` property to
* each component -- a local reference to the `Application` instance that
* the component belongs to.
* 
* @module enyo/ApplicationSupport
* @protected
*/
module.exports = {

	/**
	* @private
	*/
	name: 'ApplicationSupport',

	/**
	* @private
	*/
	adjustComponentProps: kind.inherit(function (sup) {
		return function (props) {
			props.app = props.app || this.app;
			sup.apply(this, arguments);
		};
	}),

	/**
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			// release the reference to the application
			this.app = null;
			sup.apply(this, arguments);
		};
	})

};
