require('enyo');

/**
* Contains the declaration for the {@link enyo.Controller} kind.
* @module enyo/Controller
*/

var
	kind = require('./kind'),
	utils = require('./utils');

var
	MultipleDispatchComponent = require('./MultipleDispatchComponent');

/**
* {@link enyo.Controller} is the base [kind]{@glossary kind} for all
* controllers in Enyo. An abstract kind, `enyo.Controller` is a
* [delegate]{@glossary delegate}/[component]{@link enyo.Component} that
* is designed to be a proxy for information.
*
* @namespace enyo
* @class enyo.Controller
* @extends enyo.MultipleDispatchComponent
* @definedby module:enyo/Controller
* @public
*/
module.exports = kind(
	/** @lends enyo.Controller.prototype */ {

	name: 'enyo.Controller',

	/**
	* @private
	*/
	kind: MultipleDispatchComponent,

	/**
	* Set this flag to `true` to make this [controller]{@link enyo.Controller}
	* available globally, when instanced. When set to `true`, even the
	* [owner]{@link enyo.Component#owner} (if any) cannot
	* [destroy]{@link enyo.Component#destroy} it.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	global: false,

	/**
	* The default source of information for all instances of {@link enyo.Controller}
	* and its [subkinds]{@glossary subkind}. In some cases, this will be a
	* [computed property]{@link module:enyo/ComputedSupport} to facilitate overloading.
	* It may contain any type of data.
	*
	* @type {*}
	* @default null
	* @public
	*/
	data: null,

	/**
	* @method
	* @private
	*/
	constructor: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this.global) {
				utils.setPath(this.name, this);
			}
		};
	}),
	_isController: true
});
