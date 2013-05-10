(function (enyo) {
	
	//*@public
	enyo.createMixin({
		
		// ...........................
		// PUBLIC PROPERTIES
		
		//*@public
		name: "enyo.SelectionRowSupport",
		
		//*@public
		selected: false,

		// ...........................
		// PROTECTED PROPERTIES
		
		//*@protected
		bindings: [{
			from: ".controller.selected",
			to: ".selected",
			twoWay: true,
			transform: function (value, direction, binding) {
				if (value === undefined || value === null) {
					binding.stop();
				} else {
					return value;
				}
			}
		}, {
			from: ".owner.enableSelection",
			to: ".enableSelection"
		}],
		
		//*@protected
		handlers: {
			ontap: "_tapped"
		},

		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		/**
			Will select the item if it is not already selected.
		*/
		select: function () {
			var $controller = this.controller;
			if (this.enableSelection && $controller) {
				$controller.set("selected", true);
			}
		},
		
		//*@public
		/**
			Will deselect the item if it is not already deselected.
		*/
		deselect: function () {
			var $controller = this.controller;
			if (this.enableSelection && $controller) {
				$controller.set("selected", false);
			}
		},

		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		_tapped: function () {
			debugger
			var $controller = this.controller;
			if (this.enableSelection && $controller) {
				$controller.set("selected", !$controller.get("selected"));
			}
		},

		// ...........................
		// OBSERVERS
		
		//*@protected
		_selected_changed: enyo.observer(function () {
			var selected = this.get("selected");
			this.addRemoveClass("selected", selected);
			if (selected) {
				this.dispatchBubble("onSelect", {item: this});
			} else {
				this.dispatchBubble("onDeselect", {item: this});
			}
		}, "selected")
		
	});
	
	
	//*@public
	/**
	*/
	enyo.createMixin({
		
		// ...........................
		// PUBLIC PROPERTIES
		
		//*@public
		name: "enyo.SelectionSupport",
		
		//*@public
		enableSelection: true,
		
		//*@public
		enableMultipleSelection: false,

		// ...........................
		// PROTECTED PROPERTIES
		
		//*@protected
		_supports_selection: true,
		
		//*@protected
		/**
			If the settings are already configured do not apply
			the defaults.
		*/
		override: false,
		
		//*@protected
		handlers: {
			onSelect: "_select_item",
			onDeselect: "_deselect_item",
			onClear: "_clear_selection"
		},
		
		//*@protected
		_selection_binding: {
			from: "._selection.length",
			to: "._selection_length"
		},
		
		//*@protected
		_selection: null,
		
		//*@protected
		_selection_length: 0,

		// ...........................
		// COMPUTED PROPERTIES
		
		//*@public
		/**
			If multiple selection is enabled it will return an
			_enyo.Array_ of the selection set. If only single
			selection is enabled it will return the item if there
			is any selection.
		*/
		selection: enyo.computed(function () {
			if (this.enableMultipleSelection) {
				return this._selection;
			} else if (this.enableSelection) {
				return this._selection.at(0);
			}
		}, "_selection_length", "_selection", {cached: true, defer: true}),

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		/**
			Clears the selection, if any.
		*/
		clear: function () {
			if (this.enableSelection) {
				// clear bindings and release the array
				if (this._selection) {
					this._selection.destroy();
				}
				this.set("_selection", new enyo.Array(), true);
				this.binding(this._selection_binding);
			}
		},
		
		//*@public
		select: function (item) {
			var $selection = this.get("_selection");
			var $cur;
			if (this.enableSelection) {
				if (!this.enableMultipleSelection) {
					if (($cur = $selection.at(0))) {
						this.deselect($cur);
					}
				}
				$selection.push(item);
				if (item.set) {
					item.set("selected", true);
				}
			}
		},
		
		//*@public
		deselect: function (item) {
			var $selection = this.get("_selection");
			var idx = $selection.indexOf(item);
			if (!!~idx) {
				$selection.splice(idx, 1);
				if (item.set) {
					item.set("selected", false);
				}
			}
		},

		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		_select_item: function (sender, event) {
			debugger
			this.select(event.item);
		},
		
		//*@protected
		_deselect_item: function (sender, event) {
			debugger
			this.deselect(event.item);
		},
		
		//*@protected
		_clear_selection: function (sender, event) {
			this.clear();
		},
		
		//*@protected
		create: function () {
			this.set("_selection", this._selection || new enyo.Array());
			this.binding(this.get("_selection_binding"));
		}

		// ...........................
		// OBSERVERS
		
	});
	
})(enyo);