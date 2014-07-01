(function (enyo, scope) {
	/**
	* _enyo.Group_ provides a wrapper around multiple elements.  It enables the creation of 
	* [radio groups]{@link external:input} from arbitrary [components]{@link enyo.Component} 
	* supporting the {@link enyo.GroupItem} API.
	*
	* @class enyo.Group
	* @public
	*/
	enyo.kind(
		/** @lends enyo.FloatingLayer.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Group',

		/**
		* @private
		*/
		published: {
			/**
			* If `true`, only one [GroupItem]{@link enyo.GroupItem} in the 
			* [component]{@link enyo.Component} list may be active at a given time.
			* 
			* @type {Boolean}
			* @default true
			* @memberof enyo.Group.prototype
			* @public
			*/
			highlander: true,

			/**
			* If `true`, an active highlander item may be deactivated.
			* 
			* @type {Boolean}
			* @default false
			* @memberof enyo.Group.prototype
			* @public
			*/
			allowHighlanderDeactivate: false,

			/**
			* The [control]{@link enyo.Control} that was last selected.
			* 
			* @type {Object}
			* @default null
			* @memberof enyo.Group.prototype
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
			* @memberof enyo.Group.prototype
			* @public
			*/
			groupName: ''
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
		activate: function(inSender, inEvent) {
			if ((this.groupName || inEvent.originator.groupName) && (inEvent.originator.groupName != this.groupName)) {
				return;
			}
			if (this.highlander) {
				// we can optionally accept an `allowHighlanderDeactivate` property in inEvent without directly 
				// specifying it when instatiating the group - used mainly for custom kinds requiring deactivation  
				if (inEvent.allowHighlanderDeactivate !== undefined && inEvent.allowHighlanderDeactivate !== this.allowHighlanderDeactivate) {
					this.setAllowHighlanderDeactivate(inEvent.allowHighlanderDeactivate);
				}
				// deactivation messages are ignored unless it's an attempt
				// to deactivate the highlander
				if (!inEvent.originator.active) {
					// this clause prevents deactivating a grouped item once it's been active,
					// as long as `allowHighlanderDeactivate` is false. Otherwise, the only
					// proper way to deactivate a grouped item is to choose a new highlander.
					if (inEvent.originator == this.active) {
						if (!this.allowHighlanderDeactivate) {
							this.active.setActive(true);
						} else {
							this.setActive(null);
						}
					}
				} else {
					this.setActive(inEvent.originator);
				}
			}
		},

		/**
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
		}
	});
})(enyo, this);
