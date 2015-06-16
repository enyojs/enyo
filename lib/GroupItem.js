require('enyo');

/**
* Contains the declaration for the {@link enyo.GroupItem} kind.
* @module enyo/GroupItem
*/

var
	kind = require('./kind');
var
	Control = require('./Control');

/**
* Fires when the [active state]{@link enyo.GroupItem#active} has changed.
*
* @event enyo.GroupItem#onActivate
* @type {Object}
* @property {Object} sender - The [component]{@link enyo.Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* {@link enyo.GroupItem} is the base [kind]{@glossary kind} for the
* [Grouping]{@link enyo.Group} API. It manages the
* [active state]{@link enyo.GroupItem#active} of the [component]{@link enyo.Component}
* (or the [inheriting]{@glossary subkind} component). A subkind may call `setActive()` 
* to set the [active]{@link enyo.GroupItem#active} property to the desired state; this
* will additionally [bubble]{@link enyo.Component#bubble} an 
* [onActivate]{@link enyo.GroupItem#onActivate} {@glossary event}, which may
* be handled as needed by the containing components. This is useful for creating
* groups of items whose state should be managed collectively.
*
* For an example of how this works, see the {@link enyo.Group} kind, which enables the
* creation of radio groups from arbitrary components that	support the Grouping API.
*
* @namespace enyo
* @class enyo.GroupItem
* @extends enyo.Control
* @ui
* @definedby module:enyo/GroupItem
* @public
*/
module.exports = kind(
	/** @lends enyo.Groupitem.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.GroupItem',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	published: 
		/** @lends enyo.Groupitem.prototype */ {

		/**
		* Will be `true` if the item is currently selected.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		active: false
	},
	
	/**
	* @method
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.activeChanged();
		};
	}),

	/**
	* @fires enyo.GroupItem#onActivate
	* @private
	*/
	activeChanged: function () {
		this.bubble('onActivate');
	}
});
