require('enyo');

var
	kind = require('./kind'),
	utils = require('./utils');

var
	Component = require('./Component');

/**
* {@link enyo.Signals} is a [component]{@link enyo.Component} used to listen
* to global messages.
* 
* An object with a Signals component can listen to messages sent from anywhere
* by declaring handlers for them.
* 
* DOM [events]{@glossary event} that have no node targets are broadcast as
* signals. These events include Window events, such as `onload` and
* `onbeforeunload`, as well as events that occur directly on `document`, such
* as `onkeypress` if `document` has the focus.
* 
* For more information, see the documentation on [Event
* Handling]{@linkplain $dev-guide/key-concepts/event-handling.html} in the
* Enyo Developer Guide.
*
* @class enyo.Signals
* @extends enyo.Component
* @public
*/
var Signals = module.exports = kind(
	/** @lends enyo.Signals.prototype */ {

	name: 'enyo.Signals',

	/**
	* @private
	*/
	kind: Component,

	/**
	* Needed because of early calls to bind DOM {@glossary event} listeners
	* to the [enyo.Signals.send()]{@link enyo.Signals#send} call.
	* 
	* @private
	*/


	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			Signals.addListener(this);
		};
	}),

	/**
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function() {
			Signals.removeListener(this);
			sup.apply(this, arguments);
		};
	}),

	/**
	* @private
	*/
	notify: function (msg, load) {
		this.dispatchEvent(msg, load);
	},

	/**
	* @private
	*/
	protectedStatics: {
		listeners: [],
		addListener: function(listener) {
			this.listeners.push(listener);
		},
		removeListener: function(listener) {
			utils.remove(listener, this.listeners);
		}
	},

	/**
	* @private
	*/
	statics: 
		/** @lends enyo.Signals.prototype */ {

		/**
		* Broadcasts a global message to be consumed by subscribers.
		* 
		* @param {String} msg - The message to send; usually the name of the
		*	{@glossary event}.
		* @param {Object} load - An [object]{@glossary Object} containing any
		*	associated event properties to be accessed by subscribers.
		* @public
		*/
		send: function (msg, load) {
			utils.forEach(this.listeners, function(l) {
				l.notify(msg, load);
			});
		}
	}
});