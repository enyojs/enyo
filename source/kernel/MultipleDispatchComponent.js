(function (enyo, scope) {
	/**
	* {@link enyo.MultipleDispatchComponent} is a purely abstract [kind]
	* {@glossary kind} that simply provides a common ancestor for
	* {@link enyo.Component} [objects]{@glossary Object} that need 
	* the [MultipleDispatchSupport]{@link enyo.MultipleDispatchSupport}
	* [mixin]{@glossary mixin}.
	*
	* @class enyo.MultipleDispatchComponent
	* @extends enyo.Component
	* @mixes enyo.MultipleDispatchSupport
	* @public
	*/
	enyo.kind(
		/** @lends enyo.MultipleDispatchComponent */ {

		/**
		* @private
		*/
		name: 'enyo.MultipleDispatchComponent',

		/**
		* @private
		*/
		kind: 'enyo.Component',

		/**
		* @private
		*/
		mixins: [
			enyo.MultipleDispatchSupport
		]
	});

})(enyo, this);
