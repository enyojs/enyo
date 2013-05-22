(function (enyo) {

	//*@public
	/**
	*/
	enyo.createMixin({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.DataListRowSupport",

		//*@public

		classes: "enyo-data-list-row",
		
		// ...........................
		// PROTECTED PROPERTIES
		
		//*@protected
		handlers: {
			"onModelSelected": "_model_selected",
			"onModelDeselected": "_model_deselected"
		},
		
		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		decorateEvent: function (name, event, sender) {
			event.row = this;
			this.inherited(arguments);
		},
		
		//*@protected
		destroy: function () {
			this.list = null;
		},
		
		//*@protected
		_model_selected: function () {
			var $list = this.list;
			// if the list says this row is selected and we
			// received the event that our model was selected
			if ($list.isSelected(this)) {
				this.set("selected", true);
			}
		},
		
		//*@protected
		_model_deselected: function () {
			var $list = this.list;
			// if the list says this row is not selected
			// but the row thinks that it is then we are no
			// longer selected
			if (this.get("selected") && !$list.isSelected(this)) {
				this.set("selected", false);
			}
		},
		
		_selected_changed: enyo.observer(function (property, previous, value) {
			this.addRemoveClass("selected", value);
		}, "selected")
		
	});

	//*@public
	/**
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.DataList",

		//*@public
		kind: "enyo.DataRepeater",

		//*@public
		/**
			The _enyo.DataList_ kind places its rows inside of a scroller. Any
			configurable options associated with an _enyo.Scroller_ can be
			placed in this hash and will be set accordingly on the scroller
			for this list. If none are specified default _enyo.Scroller_
			settings are used.
		*/
		scrollerOptions: null,

		//*@public
		enableSelection: true,

		//*@public
		enableMultipleSelection: false,

		//*@public
		statics: {
			defaultScrollerOptions: {
				preventScrollPropagation: false
			}
		},

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		controlParentName: "rows",

		//*@protected
		classes: "enyo-data-list",

		//*@protected
		handlers: {
			ontap: "_tapped"
		},
		
		//*@protected
		_container: {
			name: "scroller",
			kind: "enyo.Scroller",
			classes: "enyo-fill enyo-data-list-scroller",
			components: [{
				name: "upperBuffer"
			}, {
				name: "rows",
				classes: "enyo-list-rows-container"
			}, {
				name: "lowerBuffer"
			}]
		},

		// ...........................
		// COMPUTED PROPERTIES
		
		//*@public
		selection: enyo.computed(function () {
			var $selection = this._selection_set;
			if (this.enableSelection) {
				if (this.enableMultipleSelection) {
					return $selection;
				} else {
					return $selection[0];
				}
			}
			// will return undefined if selection is
			// disabled
		}, "_selection_state", {cached: true, defer: true}),

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		select: function (row) {
			if (this.enableSelection) {
				if (this.enableMultipleSelection) {
					this._selection_set.push(row);
					this.notifyObservers("_selection_state");
					row.controller.model.set("selected_" + this.getName(), true);
				} else if (!this.isSelected(row)) {
					this.clearSelection();
					this._selection_set.push(row);
					this.notifyObservers("_selection_state");
					row.controller.model.set("selected_" + this.getName(), true);
				}
			}
		},
		
		//*@public
		deselect: function (row) {
			// TODO: while this check should necessarily be here the reason it was
			// added was because there is a breakdown when destroying all current
			// rows - a row is being "deselected" here that does not have a controller...
			if (!row || !row.controller || !row.controller.model) {
				return;
			}
			var idx;
			var $selection = this._selection_set;
			if (this.enableSelection) {
				if (!!~(idx = enyo.indexOf(row, $selection))) {
					$selection.splice(idx, 1);
					this.notifyObservers("_selection_state");
					row.controller.model.set("selected_" + this.getName(), false);
				}
			}
		},
		
		//*@public
		clearSelection: function () {
			if (this.enableSelection) {
				enyo.forEach(enyo.clone(this._selection_set), this.deselect, this);
			}
		},
		
		//*@public
		toggleSelection: function (row) {
			if (row.selected) {
				this.deselect(row);
			} else {
				this.select(row);
			}
		},
		
		//*@public
		isSelected: function (row) {
			if (this.enableSelection) {
				return !!~enyo.indexOf(row, this._selection_set);
			}
			return false;
		},
		
		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		constructor: function () {
			this._selection_set = [];
			this.inherited(arguments);
		},

		//*@protected
		initComponents: function () {
			// we need the base class to complete its normal
			// init routine
			this.inherited(arguments);
			// now we can safely grab a reference to our new row-kind
			var $kind = this._child_kind;
			// we also need to ensure that it has specific properties that
			// every row needs to have such as the classes required
			if (false === enyo.hasMixin($kind, "enyo.DataListRowSupport")) {
				enyo.applyMixin("enyo.DataListRowSupport", $kind);
			}
		},

		//*@protected
		remove: function () {
			this.inherited(arguments);
			if (this.children.length === 0) {
				this.clearSelection();
			}
		},
		
		//*@protected
		adjustComponentProps: function (props) {
			this.inherited(arguments);
			props.list = this;
		},
		
		//*@protected
		_init_container: function () {
			var $container = this.get("_container");
			var $options = this.get("scrollerOptions");
			var $defaults = enyo.DataList.defaultScrollerOptions;
			enyo.mixin($container, enyo.mixin($defaults, $options));
			this.inherited(arguments);
		},
		
		//*@protected
		_tapped: function (sender, event) {
			var row = event.row;
			if (row && this.enableSelection) {
				this.toggleSelection(row);
			}
		}

	});

})(enyo);