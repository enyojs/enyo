require('enyo');

var
	kind = require('./kind');

/**
* An internally-used {@glossary mixin} applied to {@link enyo.Component}
* instances to better support [bindings]{@link enyo.Binding}.
*
* @module enyo/ComponentBindingSupport
* @protected
*/
module.exports = {
	
	/**
	* @private
	*/
	name: 'ComponentBindingSupport',
	
	/**
	* @private
	*/
	adjustComponentProps: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			props.bindingTransformOwner || (props.bindingTransformOwner = this.getInstanceOwner());
		};
	})
};
