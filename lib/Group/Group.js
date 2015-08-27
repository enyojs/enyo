require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Group~Group} kind.
* @module enyo/Group
*/

var
	kind = require('../kind');
var
	Control = require('../Control');

/**
* The extended {@glossary event} [object]{@glossary Object} that is provided when the
* [onActiveChanged]{@link module:enyo/Group~Group#onActiveChanged} event is fired.
*
* @typedef {Object} enyo.Group~ActiveChangedEvent
* @property {module:enyo/Control~Control} active - The active [control]{@link module:enyo/Control~Control} for the
*	[group]{@link module:enyo/Group~Group}.
*/

/**
* Fires when the active control is changed.
*
* @event module:enyo/Group~Group#onActiveChanged
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {module:enyo/Group~Group~ActiveChangedEvent} event - An [object]{@glossary Object} containing
*	event information.
* @public
*/

/**
* {@link module:enyo/Group~Group} provides a wrapper around multiple elements. It enables the creation of
* radio groups from arbitrary [components]{@link module:enyo/Component~Component} that support the
* {@link module:enyo/GroupItem~GroupItem} API.
*
* @class Group
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Group~Group.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Group',

	/**
	* @private
	*/
	kind: Control,
	
	/**
	* @private
	*/
	published: 
		/** @lends module:enyo/Group~Group.prototype */ {
		
		/**
		* If `true`, only one [GroupItem]{@link module:enyo/GroupItem~GroupItem} in the 
		* [component]{@link module:enyo/Component~Component} list may be active at a given time.
		* 
		* @type {Boolean}
		* @default true
		* @public
		*/
		highlander: true,

		/**
		* If `true`, an active highlander item may be deactivated.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		allowHighlanderDeactivate: false,

		/**
		* The [control]{@link module:enyo/Control~Control} that was last selected.
		* 
		* @type {Object}
		* @default null
		* @public
		*/
		active: null,
	
		/**
		* This property is used to scope this [group]{@link module:enyo/Group~Group} to a certain
		* set of [controls]{@link module:enyo/Control~Control}.  When this is used, the group only
		* controls activation of controls that have the same `groupName` property set
		* on them.
		* 
		* @type {String}
		* @default null
		* @public
		*/
		groupName: ''
	},

	/**
	* @private
	*/
	events: {
		onActiveChanged: ""
	},
	
	/**
	* @private
	*/
	handlers: {
		onActivate: 'activate'
	},

	/**
	* @private
	*/
	activate: function (sender, e) {
		if ((this.groupName || e.originator.groupName) && (e.originator.groupName != this.groupName)) {
			return;
		}
		if (this.highlander) {
			// we can optionally accept an `allowHighlanderDeactivate` property in e without directly 
			// specifying it when instatiating the group - used mainly for custom kinds requiring deactivation  
			if (e.allowHighlanderDeactivate !== undefined && e.allowHighlanderDeactivate !== this.allowHighlanderDeactivate) {
				this.setAllowHighlanderDeactivate(e.allowHighlanderDeactivate);
			}
			// deactivation messages are ignored unless it's an attempt
			// to deactivate the highlander
			if (!e.originator.active) {
				// this clause prevents deactivating a grouped item once it's been active,
				// as long as `allowHighlanderDeactivate` is false. Otherwise, the only
				// proper way to deactivate a grouped item is to choose a new highlander.
				if (e.originator == this.active) {
					if (!this.allowHighlanderDeactivate) {
						this.active.setActive(true);
					} else {
						this.setActive(null);
					}
				}
			} else {
				this.setActive(e.originator);
			}
		}
	},

	/**
	* @fires module:enyo/Group~Group#onActiveChanged
	* @private
	*/
	activeChanged: function (was) {
		if (was && !was.destroyed) {
			was.setActive(false);
			was.removeClass('active');
		}
		if (this.active) {
			this.active.addClass('active');
		}
		this.doActiveChanged({active: this.active});
	},

	// Accessibility

	/**
	* @default grid
	* @type {String}
	* @see enyo/AccessibilitySupport~AccessibilitySupport#accessibilityRole
	* @public
	*/
	accessibilityRole: 'group',

	/**
	* @private
	*/
	ariaObservers: [
		{path: 'active', method: function () {
			this.setAriaAttribute('aria-activedescendant', this.active ? this.active.getId() : null);
		}}
	]
});
