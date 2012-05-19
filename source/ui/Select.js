/**
	_enyo.Select_ implements an HTML selection widget, using
	[enyo.Option](#enyo.Option) kinds by default.

	Example:

		{kind: "Select", onchange: "selectChanged", components: [
			{content: "Descending", value: "d"},
			{content: "Ascending", value: "a"}
		]}

		selectChanged: function(inSender, inEvent) {
			var s = inSender.getSelected();
			if (s == "d") {
				this.sortListDescending();
			} else {
				this.sortListAscending();
			}
		}
*/

enyo.kind({
	name: "enyo.Select",
	published: {
		//* Index of the selected option in the list
		selected: 0
	},
	//* @protected
	handlers: {
		onchange: "change"
	},
	tag: "select",
	defaultKind: "enyo.Option",
	rendered: function() {
		this.inherited(arguments);
		this.selectedChanged();
	},
	getSelected: function() {
		return Number(this.getNodeProperty("selectedIndex", this.selected));
	},
	setSelected: function(inIndex) {
		// default property mechanism can't track changed correctly for virtual properties
		this.setPropertyValue("selected", Number(inIndex), "selectedChanged");
	},
	selectedChanged: function() {
		this.setNodeProperty("selectedIndex", this.selected);
	},
	change: function() {
		this.selected = this.getSelected();
	},
	render: function() {
		// work around IE bug with innerHTML setting of <select>, rerender parent instead
		// http://support.microsoft.com/default.aspx?scid=kb;en-us;276228
		if (enyo.platform.ie) {
			this.parent.render();
		} else {
			this.inherited(arguments);
		}
	},
	//* @public
	//* Returns the value of the selected option.
	getValue: function() {
		if (this.hasNode()) {
			return this.node.value;
		}
	}
});

/**
	enyo.Option implements the options in an HTML select widget.
*/
enyo.kind({
	name: "enyo.Option",
	published: {
		value: ""
	},
	//* @protected
	tag: "option",
	create: function() {
		this.inherited(arguments);
		this.valueChanged();
	},
	valueChanged: function() {
		this.setAttribute("value", this.value);
	}
});

/**
	enyo.OptionGroup allows for grouping options in a select widget, and for
	blocks of options to be disabled.
*/
enyo.kind({
	name: "enyo.OptionGroup",
	published: {
		label: ""
	},
	//* @protected
	tag: "optgroup",
	defaultKind: "enyo.Option",
	create: function() {
		this.inherited(arguments);
		this.labelChanged();
	},
	labelChanged: function() {
		this.setAttribute("label", this.label);
	}
});
