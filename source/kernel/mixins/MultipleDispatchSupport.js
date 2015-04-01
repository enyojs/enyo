(function (enyo, scope) {

	/**
	* A collection of methods to allow a single {@link enyo.Component} to
	* [dispatch]{@link enyo.Component#dispatchEvent} a single {@glossary event} to
	* multiple targets. The events are synchronously propagated in the order in
	* which the targets are encountered. Note that this {@glossary mixin} is
	* already applied to a base [kind]{@glossary kind},
	* {@link enyo.MultipleDispatchComponent}.
	*
	* @mixin enyo.MultipleDispatchSupport
	* @public
	*/
	enyo.MultipleDispatchSupport = {
		
		/**
		* @private
		*/
		name: 'MultipleDispatchSupport',
		
		/**
		* Adds a target for dispatching.
		*
		* @param {enyo.Component} component - The {@link enyo.Component} to add as a dispatch target.
		* @public
		*/
		addDispatchTarget: function (component) {
			var dt = this._dispatchTargets;
			if (component && !~enyo.indexOf(component, dt)) {
				dt.push(component);
			}
		},
		/**
		* Removes a target from dispatching.
		*
		* @param {enyo.Component} component - The {@link enyo.Component} to remove as a dispatch
		*	target.
		* @public
		*/
		removeDispatchTarget: function (component) {
			var dt = this._dispatchTargets, i;
			i = enyo.indexOf(component, dt);
			if (i > -1) {
				dt.splice(i, 1);
			}
		},
		
		/**
		* @private
		*/
		bubbleUp: enyo.inherit(function (sup) {
			return function (name, event, sender) {
				if (this._dispatchDefaultPath) {
					sup.apply(this, arguments);
				}
				var dt = this._dispatchTargets;
				for (var i=0, t; (t=dt[i]); ++i) {
					if (t && !t.destroyed) {
						t.dispatchBubble(name, event, sender);
					}
				}
			};
		}),
		
		/**
		* @private
		*/
		ownerChanged: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				var o = this.owner;
				this._dispatchDefaultPath = !! o;
			};
		}),
		
		/**
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				this._dispatchTargets = [];
				return sup.apply(this, arguments);
			};
		}),
		
		/**
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				this._dispatchTargets = null;
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* @private
		*/
		_dispatchDefaultPath: false
	};
	
})(enyo, this);
