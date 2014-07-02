(function (enyo, scope) {
	/**
	* The extended [event]{@glossary event} [object]{@glossary Object} that is provided when the 
	* [onActiveChanged]{@link enyo.Group#event:onActiveChanged} [event]{@glossary event} is fired.
	*
	* @typedef {Object} enyo.Group~ActiveChangedEvent
	* @property {enyo.Control} active The active [control]{@link enyo.Control} for the
	*	[group]{@link enyo.Group}.
	*/

	/**
	* Fires when the active control is changed.
	*
	* @event enyo.Group#event:onActiveChanged
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {enyo.Group~ActiveChangedEvent} event - An [object]{@glossary Object} containing 
	*	[event]{@glossary event} information.
	* @public
	*/

	/**
	* _enyo.Group_ provides a wrapper around multiple elements. It enables the creation of 
	* [radio groups]{@link external:input} from arbitrary [components]{@link enyo.Component} 
	* supporting the {@link enyo.GroupItem} API.
	*
	* @ui
	* @class enyo.Group
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Group.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Group',

		/**
		* @private
		*/
		published: 
			/** @lends enyo.Group.prototype */ {
			
			/**
			* If `true`, only one [GroupItem]{@link enyo.GroupItem} in the 
			* [component]{@link enyo.Component} list may be active at a given time.
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
			* The [control]{@link enyo.Control} that was last selected.
			* 
			* @type {Object}
			* @default null
			* @public
			*/
			active: null,
		
			/**
			* The _groupName_ property is used to scope this [group]{@link enyo.Group} to a certain
			* set of [controls]{@link enyo.Control}.  When used, the [group]{@link enyo.Group} only 
			* controls activation of [controls]{@link enyo.Control} who have the same _groupName_
			* property set on them.
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
		activate: function(sender, e) {
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
		* @fires enyo.Group#event:onActiveChanged
		* @private
		*/
		activeChanged: function(inOld) {
			if (inOld) {
				inOld.setActive(false);
				inOld.removeClass('active');
			}
			if (this.active) {
				this.active.addClass('active');
			}
			this.doActiveChanged({active: this.active});
		}
	});

})(enyo, this);
