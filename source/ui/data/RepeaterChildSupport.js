(function (enyo, scope) {
	/**
	* The {@link enyo.RepeaterChildSupport} [mixin]{@glossary mixin} contains methods and
	* properties that are automatically applied to all children of {@link enyo.DataRepeater}
	* to assist in selection support. (See {@link enyo.DataRepeater} for details on how to
	* use selection support.) This mixin also [adds]{@link enyo.Repeater#decorateEvent} the
	* `model`, `child` ([control]{@link enyo.Control} instance), and `index` properties to
	* all [events]{@glossary event} emitted from the repeater's children.
	*
	* @mixin enyo.RepeaterChildSupport
	* @public
	*/
	enyo.RepeaterChildSupport = {

		/*
		* @private
		*/
		name: 'RepeaterChildSupport',

		/**
		* Indicates whether the current child is selected in the [repeater]{@link enyo.DataRepeater}.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		selected: false,
		
		/*
		* @method
		* @private
		*/
		selectedChanged: enyo.inherit(function (sup) {
			return function () {
				if (this.repeater.selection) {
					this.addRemoveClass(this.selectedClass || 'selected', this.selected);
					// for efficiency purposes, we now directly call this method as opposed to
					// forcing a synchronous event dispatch
					var idx = this.repeater.collection.indexOf(this.model);
					if (this.selected && !this.repeater.isSelected(this.model)) {
						this.repeater.select(idx);
					} else if (!this.selected && this.repeater.isSelected(this.model)) {
						this.repeater.deselect(idx);
					}
				}
				sup.apply(this, arguments);
			};
		}),

		/*
		* @method
		* @private
		*/
		decorateEvent: enyo.inherit(function (sup) {
			return function (sender, event) {
				event.model = this.model;
				event.child = this;
				event.index = this.repeater.collection.indexOf(this.model);
				sup.apply(this, arguments);
			};
		}),

		/*
		* @private
		*/
		_selectionHandler: function () {
			if (this.repeater.selection && !this.get('disabled')) {
				if (!this.repeater.groupSelection || !this.selected) {
					this.set('selected', !this.selected);
				}
			}
		},
		/**
		* Deliberately used to supersede the default method and set 
		* [owner]{@link enyo.Component#owner} to this [control]{@link enyo.Control} so that there 
		* are no name collisions in the instance [owner]{@link enyo.Component#owner}, and also so 
		* that [bindings]{@link enyo.Binding} will correctly map to names.
		*
		* @method
		* @private
		*/
		createClientComponents: enyo.inherit(function () {
			return function (components) {
				this.createComponents(components, {owner: this});
			};
		}),
		/**
		* Used so that we don't stomp on any built-in handlers for the `ontap`
		* {@glossary event}.
		*
		* @method
		* @private
		*/
		dispatchEvent: enyo.inherit(function (sup) {
			return function (name, event, sender) {
				if (!event._fromRepeaterChild) {
					if (!!~enyo.indexOf(name, this.repeater.selectionEvents)) {
						this._selectionHandler();
						event._fromRepeaterChild = true;
					}
				}
				return sup.apply(this, arguments);
			};
		}),

		/*
		* @method
		* @private
		*/
		constructed: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				var r = this.repeater,
					s = r.selectionProperty;
				// this property will only be set if the instance of the repeater needs
				// to track the selected state from the view and model and keep them in sync
				if (s) {
					var bnd = this.binding({
						from: 'model.' + s,
						to: 'selected',
						oneWay: false/*,
						kind: enyo.BooleanBinding*/
					});
					this._selectionBindingId = bnd.euid;
				}
			};
		}),

		/*
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				if (this._selectionBindingId) {
					var b$ = enyo.Binding.find(this._selectionBindingId);
					if (b$) {
						b$.destroy();
					}
				}
				sup.apply(this, arguments);
			};
		}),

		/*
		* @private
		*/
		_selectionBindingId: null
	};

})(enyo, this);
