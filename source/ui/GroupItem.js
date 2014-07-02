(function (enyo, scope) {
	/**
	* Fires when the [active state]{@link enyo.GroupItem#active} has changed.
	*
	* @event enyo.GroupItem#onActivate
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* _enyo.GroupItem_ is the base [kind]{@link external:kind} for the [Grouping]{@link enyo.Group} 
	* API. It manages the [active state]{@link enyo.GroupItem#active} of the 
	* [component]{@link enyo.Component} (or the [inheriting]{@link external:subkind} 
	* [component]{@link enyo.Component}). A [subkind]{@link external:subkind} may call `setActive` 
	* to set the [active]{@link enyo.GroupItem#active} property to the desired state; this will 
	* additionally [bubble]{@link enyo.Component#bubble} an 
	* [onActivate]{@link enyo.Groupitem#event:onActivate} [event]{@link external:event}, which can 
	* be handled as needed by the containing [components]{@link enyo.Component}. This is useful for 
	* creating [groups]{@link enyo.Group} of items whose state should be managed as a 
	* [group]{@link enyo.Group}.
	* 
	* For an example of how this works, see the
	* <a href="#enyo.Group">enyo.Group</a> kind, which enables the creation of
	* radio groups from arbitrary components that	support the Grouping API.
	*
	* @class enyo.GroupItem
	* @public
	*/
	enyo.kind(
		/** @lends enyo.FloatingLayer.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.GroupItem',

		/**
		* @private
		*/
		published: {

			/**
			* This is `true` if the item is currently selected
			* 
			* @type {Boolean}
			* @default false
			* @memberof enyo.GroupItem.prototype
			* @public
			*/
			active: false
		},
		
		/**
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.activeChanged();
			};
		}),

		/**
		* @fires enyo.GroupItem#event:onActivate
		* @private
		*/
		activeChanged: function() {
			this.bubble('onActivate');
		}
	});
})(enyo, this);
