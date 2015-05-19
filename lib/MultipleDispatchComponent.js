require('enyo');

/**
* Contains the declaration for the {@link enyo.MultipleDispatchComponent} kind.
* @module enyo/MultipleDispatchComponent
*/

var
	kind = require('./kind');

var
	Component = require('./Component'),
	MultipleDispatchSupport = require('./MultipleDispatchSupport');

/**
* {@link enyo.MultipleDispatchComponent} is a purely abstract [kind]
* {@glossary kind} that simply provides a common ancestor for
* {@link enyo.Component} [objects]{@glossary Object} that need 
* the [MultipleDispatchSupport]{@link enyo.MultipleDispatchSupport}
* [mixin]{@glossary mixin}.
*
* @namespace enyo
* @class enyo.MultipleDispatchComponent
* @extends enyo.Component
* @mixes enyo.MultipleDispatchSupport
* @definedby module:enyo/MultipleDispatchComponent
* @public
*/
module.exports = kind(
	/** @lends enyo.MultipleDispatchComponent */ {

	/**
	* @private
	*/
	kind: Component,

	/**
	* @private
	*/
	mixins: [MultipleDispatchSupport]
});
