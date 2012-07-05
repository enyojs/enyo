/** _enyo.Selection_ is used to manage row selection state for lists. It provides selection state management
	for single and multiselect lists.

		//This is an excerpt from <a href="#enyo.FlyweightRepeater">enyo.FlyweightRepeater</a>:
		enyo.kind({
			name: "enyo.FlyweightRepeater",
			...
			components: [
				{kind: "Selection", onSelect: "selectDeselect", onDeselect: "selectDeselect"},
				...
			],
			tap: function(inSender, inEvent) {
				...
				//mark the tapped row as selected
				this.$.selection.select(inEvent.index);
				...
			},
			selectDeselect: function(inSender, inEvent) {
				//this is where a row selection highlight might be applied
				this.renderRow(inEvent.key);
			}
			...
		})
*/
enyo.kind({
	name: "enyo.Selection",
	kind: enyo.Component,
	published: {
		//* If true, multiple selections are allowed.
		multi: false
	},
	events: {
		/**
			Fires when an item is selected.

				{kind: "Selection", onSelect: "selectRow"...
				...
				selectRow: function(inSender, inEvent) {
					...

			_inEvent.key_ is whatever key was used to register 
			the selection, usually a row index.

			_inEvent.data_ references data registered
			with this key by the code that made the selection.
		*/
		onSelect: "",
		/**
			Fires when an item is deselected.

				{kind: "Selection", onSelect: "deselectRow"...
				...
				deselectRow: function(inSender, inEvent)
					...

			_inEvent.key_ is whatever key was used to request
			the deselection, usually a row index.

			_inEvent.data_ references data registered
			with this key by the code that made the original 
			selection.
		*/
		onDeselect: "",
		//* Sent when selection changes (but not when the selection is cleared).
		onChange: ""
	},
	//* @protected
	create: function() {
		this.clear();
		this.inherited(arguments);
	},
	multiChanged: function() {
		if (!this.multi) {
			this.clear();
		}
		this.doChange();
	},
	highlander: function(inKey) {
		if (!this.multi) {
			this.deselect(this.lastSelected);
		}
	},
	//* @public
	//* Removes all selections.
	clear: function() {
		this.selected = [];
	},
	//* Returns true if the inKey row is selected.
	isSelected: function(inKey) {
		return this.selected[inKey];
	},
	//* Manually sets a row's state to selected or unselected.
	setByKey: function(inKey, inSelected, inData) {
		if (inSelected) {
			this.selected[inKey] = (inData || true);
			this.lastSelected = inKey;
			this.doSelect({key: inKey, data: this.selected[inKey]});
		} else {
			var was = this.isSelected(inKey);
			delete this.selected[inKey];
			this.doDeselect({key: inKey, data: was});
		}
		this.doChange();
	},
	//* Deselects a row.
	deselect: function(inKey) {
		if (this.isSelected(inKey)) {
			this.setByKey(inKey, false);
		}
	},
	//* Selects a row. If the multi property is set to false,
	//* it will also deselect the previous selection.
	select: function(inKey, inData) {
		if (this.multi) {
			this.setByKey(inKey, !this.isSelected(inKey), inData);
		} else if (!this.isSelected(inKey)) {
			this.highlander();
			this.setByKey(inKey, true, inData);
		}
	},
	//* Toggles selection state for a row. If the multi property is set to
	//* false, toggling a selection on will deselect the previous selection.
	toggle: function(inKey, inData) {
		if (!this.multi && this.lastSelected != inKey) {
			this.deselect(this.lastSelected);
		}
		this.setByKey(inKey, !this.isSelected(inKey), inData);
	},
	//* Returns the selection.
	getSelected: function() {
		return this.selected;
	}
});
