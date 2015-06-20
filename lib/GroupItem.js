require('enyo');

/**
* Contains the declaration for the {@link module:enyo/GroupItem~GroupItem} kind.
* @module enyo/GroupItem
*/

var
	kind = require('./kind');
var
	Control = require('./Control');

/**
* Fires when the [active state]{@link module:enyo/GroupItem~GroupItem#active} has changed.
*
* @event module:enyo/GroupItem~GroupItem#onActivate
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* {@link module:enyo/GroupItem~GroupItem} is the base [kind]{@glossary kind} for the
* [Grouping]{@link module:enyo/Group~Group} API. It manages the
* [active state]{@link module:enyo/GroupItem~GroupItem#active} of the [component]{@link module:enyo/Component~Component}
* (or the [inheriting]{@glossary subkind} component). A subkind may call `setActive()` 
* to set the [active]{@link module:enyo/GroupItem~GroupItem#active} property to the desired state; this
* will additionally [bubble]{@link module:enyo/Component~Component#bubble} an 
* [onActivate]{@link module:enyo/GroupItem~GroupItem#onActivate} {@glossary event}, which may
* be handled as needed by the containing components. This is useful for creating
* groups of items whose state should be managed collectively.
*
* For an example of how this works, see the {@link module:enyo/Group~Group} kind, which enables the
* creation of radio groups from arbitrary components that	support the Grouping API.
*
* @class GroupItem
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Groupitem~Groupitem.prototype */ {

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
		/** @lends module:enyo/Groupitem~Groupitem.prototype */ {

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
	* @fires module:enyo/GroupItem~GroupItem#onActivate
	* @private
	*/
	activeChanged: function () {
		this.bubble('onActivate');
	}
});
