(function (enyo, scope) {
	/**
	* Fires when checkbox is tapped.
	*
	* @event enyo.Checkbox#onActivate
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing 
	*	[event]{@glossary event} information.
	* @public
	*/

	/**
	* `enyo.Checkbox` implements an HTML checkbox [input]{@glossary input}, with support for
	* grouping using {@link enyo.Group}.
	*
	* @ui
	* @class enyo.Checkbox
	* @extends enyo.Input
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Checkbox.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Checkbox',

		/**
		* @private
		*/
		kind: 'enyo.Input',

		/**
		* @private
		*/
		classes: 'enyo-checkbox',

		/**
		* @private
		*/
		events: {
			onActivate: ''
		},

		/**
		* @private
		*/
		published: 
			/** @lends enyo.Checkbox.prototype */ {
			
			/**
			* Value of [checkbox]{@link enyo.Checkbox}; `true` if checked.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			checked: false,
			
			/**
			* [Group API]{@link enyo.Group} requirement for determining selected item
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			active: false,
			
			/**
			* @private
			*/
			type: 'checkbox'
		},
		
		/**
		* Disable classes inherited from {@link enyo.Input}.
		* 
		* @private
		*/
		kindClasses: "",

		/**
		* @private
		*/
		handlers: {
			onchange: 'change',
			onclick: 'click'
		},

		/**
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				if (this.active) {
					this.activeChanged();
				}
				this.checkedChanged();
			};
		}),

		/**
		* @private
		*/
		checkedChanged: function() {
			this.setNodeProperty('checked', this.checked);
			this.setAttribute('checked', this.checked ? 'checked' : '');
			this.setActive(this.checked);
		},

		/**
		* The [active]{@link enyo.Checkbox#active} property, and onActivate 
		* [event]{@glossary event}, are part of the [GroupItem]{@link enyo.Groupitem} interface
		* that we support in this [object]{@glossary Object}.
		* 
		* @private
		*/
		activeChanged: function() {
			this.active = enyo.isTrue(this.active);
			this.setChecked(this.active);
			this.bubble('onActivate');
		},

		/**
		* All [input]{@link enyo.Input} type [controls]{@link enyo.Control} support the 
		* [value]{@link enyo.Input#value} property.
		*
		* @param {Boolean} val - Whether the [checkbox]{@link enyo.Checkbox} should be checked or not.
		*	The value will be treated as `true` if it is truthy, otherwise it 
		*	will be considered `false`.
		* @public
		*/
		setValue: function(val) {
			this.setChecked(enyo.isTrue(val));
		},

		/**
		* Retrieve the current [value]{@link enyo.Input#value} of the [checkbox]{@link enyo.Checkbox}
		*
		* @returns {Boolean} `true` if the [checkbox]{@link enyo.Checkbox} is checked; `false`
		*	otherwise.
		* @public
		*/
		getValue: function() {
			return this.getChecked();
		},

		/**
		* @private
		*/
		valueChanged: function() {

		/**
		* @private
		*/
		// inherited behavior is to set "value" attribute and node-property
		// which does not apply to checkbox (uses "checked") so
		// we squelch the inherited method
		},
		change: function() {
			var nodeChecked = enyo.isTrue(this.getNodeProperty('checked'));
			this.setActive(nodeChecked);
		},

		/**
		* @private
		*/
		click: function(sender, e) {
			// Various versions of IE (notably IE8) do not fire 'onchange' for
			// checkboxes, so we discern change via 'click'.
			// Note: keyboard interaction (e.g. pressing space when focused) fires
			// a click event.
			if (enyo.platform.ie <= 8) {
				this.bubble('onchange', e);
			}
		}
	});

})(enyo, this);
