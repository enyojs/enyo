(function (enyo, scope) {
	/**
	* {@link enyo.Controller} is the base [kind]{@glossary kind} for all
	* controllers in Enyo. An abstract kind, `enyo.Controller` is a
	* [delegate]{@glossary delegate}/[component]{@link enyo.Component} that
	* is designed to be a proxy for information.
	*
	* @class enyo.Controller
	* @extends enyo.MultipleDispatchComponent
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Controller.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Controller',

		/**
		* @private
		*/
		kind: 'enyo.MultipleDispatchComponent',

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
		* [computed property]{@link enyo.ComputedSupport} to facilitate overloading.
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
		constructor: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				if (this.global) {
					enyo.setPath(this.name, this);
				}
			};
		}),
		_isController: true
	});

})(enyo, this);
