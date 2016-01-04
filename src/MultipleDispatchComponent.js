require('enyo');

/**
* Contains the declaration for the {@link module:enyo/MultipleDispatchComponent~MultipleDispatchComponent} kind.
* @module enyo/MultipleDispatchComponent
*/

var
	kind = require('./kind');

var
	Component = require('./Component'),
	MultipleDispatchSupport = require('./MultipleDispatchSupport');

/**
* {@link module:enyo/MultipleDispatchComponent~MultipleDispatchComponent} is a purely abstract
* {@glossary kind} that simply provides a common ancestor for
* {@link module:enyo/Component~Component} [objects]{@glossary Object} that need 
* the [MultipleDispatchSupport]{@link module:enyo/MultipleDispatchSupport~MultipleDispatchSupport}
* {@glossary mixin}.
*
* @class MultipleDispatchComponent
* @extends module:enyo/Component~Component
* @mixes module:enyo/MultipleDispatchSupport~MultipleDispatchSupport
* @public
*/
module.exports = kind(
	/** @lends module:enyo/MultipleDispatchComponent~MultipleDispatchComponent */ {

	/**
	* @private
	*/
	kind: Component,

	/**
	* @private
	*/
	mixins: [MultipleDispatchSupport]
});
