/**
	_enyo.Select_ implements an HTML selection widget, using
	[enyo.Option](#enyo.Option) kinds by default.

	Example:

		{kind: "Select", onchange: "selectChanged", components: [
			{content: "Descending", value: "d"},
			{content: "Ascending", value: "a"}
		]}

		selectChanged: function(inSender, inEvent) {
			var s = inSender.getValue();
			if (s == "d") {
				this.sortListDescending();
			} else {
				this.sortListAscending();
			}
		}

	Note: This uses the `<select>` tag, which isn't implemented
	for native webOS applications, although it does work in the
	webOS Web browser.
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
	rendered: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			//Trick to force IE8 onchange event bubble
			if(enyo.platform.ie == 8){
				this.setAttribute("onchange", enyo.bubbler);
			}
			this.selectedChanged();
		};
	}),
	getSelected: function() {
		return Number(this.getNodeProperty("selectedIndex", this.selected));
	},
	selectedChanged: function() {
		this.setNodeProperty("selectedIndex", this.selected);
	},
	change: function() {
		this.selected = this.getSelected();
	},
	render: enyo.inherit(function (sup) {
		return function() {
			// work around IE bug with innerHTML setting of <select>, rerender parent instead
			// http://support.microsoft.com/default.aspx?scid=kb;en-us;276228
			if (enyo.platform.ie) {
				this.parent.render();
			} else {
				sup.apply(this, arguments);
			}
		};
	}),
	//* @public
	//* Returns the value of the selected option.
	getValue: function() {
		if (this.hasNode()) {
			return this.node.value;
		}
	}
});

/**
	_enyo.Option_ implements the options in an HTML select widget.
*/
enyo.kind({
	name: "enyo.Option",
	published: {
		//* Value of the option
		value: ""
	},
	//* @protected
	tag: "option",
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.valueChanged();
		};
	}),
	valueChanged: function() {
		this.setAttribute("value", this.value);
	}
});

/**
	_enyo.OptionGroup_ allows for the grouping of options in a select widget,
	and for the disabling of blocks of options.
*/
enyo.kind({
	name: "enyo.OptionGroup",
	published: {
		label: ""
	},
	//* @protected
	tag: "optgroup",
	defaultKind: "enyo.Option",
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.labelChanged();
		};
	}),
	labelChanged: function() {
		this.setAttribute("label", this.label);
	}
});
