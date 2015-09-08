require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Controller~Controller} kind.
* @module enyo/Controller
*/

var
	kind = require('./kind'),
	utils = require('./utils');

var
	MultipleDispatchComponent = require('./MultipleDispatchComponent');

/**
* {@link module:enyo/Controller~Controller} is the base [kind]{@glossary kind} for all
* controllers in Enyo. An abstract kind, `enyo.Controller` is a
* [delegate]{@glossary delegate}/[component]{@link module:enyo/Component~Component} that
* is designed to be a proxy for information.
*
* @class Controller
* @extends module:enyo/MultipleDispatchComponent~MultipleDispatchComponent
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Controller~Controller.prototype */ {

	name: 'enyo.Controller',

	/**
	* @private
	*/
	kind: MultipleDispatchComponent,

	/**
	* Set this flag to `true` to make this [controller]{@link module:enyo/Controller~Controller}
	* available globally, when instanced. When set to `true`, even the
	* [owner]{@link module:enyo/Component~Component#owner} (if any) cannot
	* [destroy]{@link module:enyo/Component~Component#destroy} it.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	global: false,

	/**
	* The default source of information for all instances of {@link module:enyo/Controller~Controller}
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
			// don't attempt to set a controller globally without a name
			if (this.global && this.name) {
				utils.setPath.call(global, this.name, this);
			}
		};
	}),
	_isController: true
});
